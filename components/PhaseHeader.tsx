import * as anchor from "@project-serum/anchor";
import { CandyMachineAccount } from "../helpers/candy-machine";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import useWalletBalance from "../hooks/useWalletBalance";
export enum Phase {
  WaitForCM,
  Live,
  Unknown,
  NotLive,
}

export function getPhase(candyMachine: CandyMachineAccount | undefined): Phase {
  return Phase.Live;
}

interface DarkContainerProps {
  text: string | undefined;
  mintInfo?: boolean;
  whiteList?: boolean;
  candyMachine?: CandyMachineAccount | undefined;
}
export const DarkContainer = ({
  text,
  mintInfo,
  whiteList,
  candyMachine,
}: DarkContainerProps) => {
  const normalPrice: any | undefined = candyMachine?.state?.price;
  const discountPrice: any | undefined =
    candyMachine?.state?.whitelistMintSettings?.discountPrice;

  const balance = useWalletBalance()[0].toFixed(2);
  if (mintInfo) {
    return (
      <div className="box">
        <div className="halfbox">
          <h4>Price</h4>
          <span>
            {whiteList && discountPrice
              ? discountPrice / LAMPORTS_PER_SOL
              : normalPrice / LAMPORTS_PER_SOL}
          </span>
          <span>SOL</span>
        </div>
        <div className="halfbox">
          <h4>Balance</h4>
          <span>{balance}</span>
          <span>SOL</span>
        </div>
      </div>
    );
  } else {
    return (
      <div className="box">
        <h4>
          {text}
        </h4>
      </div>
    );
  }
};

const Header = (props: {
  phaseName: string;
  desc: string;
  date: anchor.BN | undefined;
  status?: string | undefined;
  whiteList?: boolean | undefined;
  candyMachine?: CandyMachineAccount | undefined;
}) => {
  const { phaseName, desc, date, status, whiteList, candyMachine } = props;
  return (
    <>
      <h3>{phaseName} &nbsp; ({candyMachine?.state.itemsRedeemed}/{candyMachine?.state.itemsAvailable})</h3>
      <h3>{desc}</h3>
      <div className="innerbox">
        <DarkContainer text={status} />
        <DarkContainer
          text={``}
          mintInfo
          whiteList={whiteList}
          candyMachine={candyMachine}
        />
      </div>
    </>
  );
};

type PhaseHeaderProps = {
  candyMachine?: CandyMachineAccount;
  rpcUrl: string;
  whiteList: boolean;
};

export const PhaseHeader = ({ candyMachine, whiteList }: PhaseHeaderProps) => {
  console.log("White Listed", whiteList, candyMachine);
  const phase = getPhase(candyMachine);
  return (
    <>
      {phase === Phase.Unknown && !candyMachine && (
        <Header
          phaseName={"Loading..."}
          desc={"Waiting for you to connect your wallet."}
          date={undefined}
        />
      )}

      {phase === Phase.Live && (
        <Header
          phaseName={`Minted / Total`}
          desc={""}
          date={candyMachine?.state.goLiveDate}
          status={whiteList ? "White List Activated" : "LIVE"}
          whiteList={whiteList}
          candyMachine={candyMachine}
        />
      )}
    </>
  );
};
