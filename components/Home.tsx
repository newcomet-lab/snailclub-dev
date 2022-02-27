import { useEffect, useMemo, useState } from "react";
import Head from "next/head";
import Link from 'next/link';

import { Snackbar } from "@material-ui/core";
import { toDate } from "../helpers/utils";
import Countdown from "react-countdown";
import Alert from "@material-ui/lab/Alert";

import * as anchor from "@project-serum/anchor";

import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { PublicKey } from "@solana/web3.js";
import { useWallet } from "@solana/wallet-adapter-react";
import useSplToken from "../hooks/useSplToken";
import ReactCountdown from "./ReactCountdown";
import {
  awaitTransactionSignatureConfirmation,
  CandyMachineAccount,
  CANDY_MACHINE_PROGRAM,
  getCandyMachineState,
  mintOneToken,
} from "../helpers/candy-machine";

import { AlertState } from "../helpers/utils";
import { MintButton } from "./MintButton";
import { PhaseHeader } from "./PhaseHeader";
import { GatewayProvider } from "@civic/solana-gateway-react";

import home_head_1 from '../static/home_head_1';
import home_footer_1 from '../static/home_footer_1';
import home_section_1 from '../static/home_section_1';
import home_section_2 from '../static/home_section_2';
import home_section_3 from '../static/home_section_3';

export interface HomeProps {
  candyMachineId?: anchor.web3.PublicKey;
  connection: anchor.web3.Connection;
  startDate: number;
  txTimeout: number;
  rpcHost: string;
}

const Home = (props: HomeProps) => {
  const [yourSOLBalance, setYourSOLBalance] = useState<number | null>(null);
  const rpcUrl = props.rpcHost;
  const [isMinting, setIsMinting] = useState(false); // true when user got to press MINT
  const wallet = useWallet();
  const [candyMachine, setCandyMachine] = useState<CandyMachineAccount>();
  const [isLoading, isSPLExists] = useSplToken();
  const anchorWallet = useMemo(() => {
    if (
      !wallet ||
      !wallet.publicKey ||
      !wallet.signAllTransactions ||
      !wallet.signTransaction
    ) {
      return;
    }

    return {
      publicKey: wallet.publicKey,
      signAllTransactions: wallet.signAllTransactions,
      signTransaction: wallet.signTransaction,
    } as anchor.Wallet;
  }, [wallet]);

  const [alertState, setAlertState] = useState<AlertState>({
    open: false,
    message: "",
    severity: undefined,
  });

  const onMint = async () => {
    try {
      setIsMinting(true);
      document.getElementById("#identity")?.click();
      if (wallet.connected && candyMachine?.program && wallet.publicKey) {
        const mintTxId = (
          await mintOneToken(candyMachine, wallet.publicKey)
        )[0];

        let status: any = { err: true };
        if (mintTxId) {
          status = await awaitTransactionSignatureConfirmation(
            mintTxId,
            props.txTimeout,
            props.connection,
            "singleGossip",
            true
          );
        }

        if (!status?.err) {
          setAlertState({
            open: true,
            message: "Congratulations! Mint succeeded!",
            severity: "success",
          });
        } else {
          setAlertState({
            open: true,
            message: "Mint failed! Please try again!",
            severity: "error",
          });
        }
      }
    } catch (error: any) {
      console.log("err ", error);
      // TODO: blech:
      let message = error.msg || "Minting failed! Please try again!";
      if (!error.msg) {
        if (!error.message) {
          message = "Transaction Timeout! Please try again.";
        } else if (error.message.indexOf("0x138")) {
        } else if (error.message.indexOf("0x137")) {
          message = `SOLD OUT!`;
        } else if (error.message.indexOf("0x135")) {
          message = `Insufficient funds to mint. Please fund your wallet.`;
        }
      } else {
        if (error.code === 311) {
          message = `SOLD OUT!`;
          window.location.reload();
        } else if (error.code === 312) {
          message = `Minting period hasn't started yet.`;
        }
      }

      setAlertState({
        open: true,
        message,
        severity: "error",
      });
    } finally {
      setIsMinting(false);
    }
  };

  useEffect(() => {
    (async () => {
      if (!anchorWallet) {
        return;
      }

      const balance = await props.connection.getBalance(anchorWallet.publicKey);
      setYourSOLBalance(balance);

      if (props.candyMachineId) {
        try {
          const cndy = await getCandyMachineState(
            anchorWallet,
            props.candyMachineId,
            props.connection
          );
          setCandyMachine(cndy);
        } catch (e) {
          console.log("Problem getting candy machine state");
          console.log(e);
        }
      } else {
        console.log("No candy machine detected in configuration.");
      }
    })();
  }, [anchorWallet, props.candyMachineId, props.connection]);

  const renderer = ({
    days,
    hours,
    minutes,
    seconds,
    completed,
  }: {
    days: any;
    hours: any;
    minutes: any;
    seconds: any;
    completed: any;
  }) => {
    if (completed) {
      return (
        <div className="mintinfoinner">
          <div className="mintinfobox">
            <PhaseHeader
              candyMachine={candyMachine}
              rpcUrl={rpcUrl}
              whiteList={isSPLExists}
            />

            <>
              {candyMachine?.state.isActive &&
              candyMachine?.state.gatekeeper &&
              wallet.publicKey &&
              wallet.signTransaction ? (
                <GatewayProvider
                  wallet={{
                    publicKey:
                      wallet.publicKey ||
                      new PublicKey(CANDY_MACHINE_PROGRAM),
                    //@ts-ignore
                    signTransaction: wallet.signTransaction,
                  }}
                  // // Replace with following when added
                  // gatekeeperNetwork={candyMachine.state.gatekeeper_network}
                  gatekeeperNetwork={
                    candyMachine?.state?.gatekeeper?.gatekeeperNetwork
                  } // This is the ignite (captcha) network
                  /// Don't need this for mainnet
                  clusterUrl={rpcUrl}
                  options={{ autoShowModal: false }}
                >
                  <MintButton
                    candyMachine={candyMachine}
                    isMinting={isMinting}
                    onMint={onMint}
                  />
                </GatewayProvider>
              ) : (
                <MintButton
                  candyMachine={candyMachine}
                  isMinting={isMinting}
                  onMint={onMint}
                />
              )}
            </>
          </div>
        </div>
      );
    } else {
      return (
        <ReactCountdown
          days={days}
          minutes={minutes}
          hours={hours}
          seconds={seconds}
        />
      );
    }
  };

  const candyMachineGoLive = toDate(candyMachine?.state.goLiveDate)?.getTime();

  return (
    <>
      <Head>
        <title>S3C</title>
        <meta charSet="UTF-8" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0"
        />
        <meta httpEquiv="content-type" content="text/html;charset=UTF-8" />
        <meta
          name="robots"
          content="max-image-preview:large"
        />
        <link rel="canonical" href="/" />
        <meta property="og:locale" content="en_US" />
        <meta property="og:type" content="article" />
        <link rel="shortcut icon" type="image/png" href="/wp-content/uploads/2022/01/favicon.jpg" />
      </Head>

      <div className="home page-template page-template-home page-template-home-php page page-id-5 wp-custom-logo wp-embed-responsive singular image-filters-enabled">
        <div dangerouslySetInnerHTML={{__html: home_head_1}} />

        <div className="header fadeInDown wow">
          <div className="col-md-12">
            <div className="logo">
              <Link href="/">
                <a>
                  <img src="/wp-content/themes/s3c/images/logo_white.png" alt=""/>
                </a>
              </Link>
            </div>
            <div className="menus menus-1">
              <div style={{float: 'right'}}>
              <WalletMultiButton className={`wallet c-wallet-flex`} />
              </div>
            </div>
            <div className="menus menus-2">
              <div dangerouslySetInnerHTML={{__html: home_section_3}} />
            </div>
          </div>
        </div>

        <div dangerouslySetInnerHTML={{__html: home_section_1}} />

        <div className="main-container" id="mint">
          <div className="sitecontainer">
            <div className="col-md-12">
              {candyMachineGoLive && wallet.connected && (
                <Countdown
                  date={isSPLExists ? 1640199600000 : candyMachineGoLive}
                  renderer={renderer}
                />
              )}
              {!candyMachine && wallet.connected && (
                <div className="sectionheading text-center">
                  <h2>Loading</h2>
                </div>
              )}
              {!wallet.connected && (
                <div className="sectionheading text-center">
                  <h2>Please connect wallet</h2>
                </div>
              )}
              <Snackbar
                open={alertState.open}
                autoHideDuration={6000}
                onClose={() => setAlertState({ ...alertState, open: false })}
              >
                <Alert
                  onClose={() => setAlertState({ ...alertState, open: false })}
                  severity={alertState.severity}
                >
                  {alertState.message}
                </Alert>
              </Snackbar>
            </div>
          </div>
        </div>

        <div dangerouslySetInnerHTML={{__html: home_section_2}} />

        <div dangerouslySetInnerHTML={{__html: home_footer_1}} />
      </div>
    </>
  );
};

export default Home;
