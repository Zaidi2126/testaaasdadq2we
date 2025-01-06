import React, { useState, useEffect, useContext } from "react";
import { useAccount } from "wagmi";
import { Slide } from "./Slide";
import { useWeb3Modal } from "@web3modal/wagmi/react";
import "bootstrap-icons/font/bootstrap-icons.css";
import {
  getNftTotalStaked,
  nftStake,
  nftUnstake,
  getNftTokenMunityMedals,
  getDaysToUnstake,
} from "../utils/Contract";
import { MyContext } from "../landingcomponents/MyContext";
import { FundingContext } from "./FundingContext";
import { StakeSettingModal } from "./StakeSettingModal";

export const SlideModal = () => {
  const AlertContext = useContext(MyContext);
  const fundingContextData = useContext(FundingContext); // Moved to top level
  const { tokenId, currentStaked } = fundingContextData;
  const [isConnect, setIsConnect] = useState(false);
  const [nftTotalStaked, setNftTotalStaked] = useState(0);
  const [nftTokenMunityMedals, setNftTokenMunityMedals] = useState(0);
  const [daysToUnstake, setDaysToUnstake] = useState(0);
  const [stakeType, setStakeType] = useState("");
  const [modalShow, setModalShow] = useState(false);
  const { address, isConnecting, isDisconnected } = useAccount();
  const { open } = useWeb3Modal();

  // Handle Modal Visibility
  const onSetModal = (visible) => setModalShow(visible);

  // Handle Stake and Unstake Actions
  const onNftStake = async () => {
    try {
      const ret = !currentStaked
        ? await nftStake(address, tokenId)
        : await nftUnstake(address, tokenId);
      AlertContext.setAlert(ret);
      setModalShow(false);
    } catch (error) {
      console.error("Error during staking/unstaking:", error.message);
    }
  };

  const onNftUnstake = async () => {
    try {
      const ret = await nftUnstake(address, tokenId);
      AlertContext.setAlert(ret);
      setModalShow(false);
    } catch (error) {
      console.error("Error during unstaking:", error.message);
    }
  };

  useEffect(() => {
    (async () => {
      if (!address || !tokenId) {
        console.warn("Invalid address or tokenId:", { address, tokenId });
        return;
      }
      try {
        const days = await getDaysToUnstake(tokenId);
        setDaysToUnstake(days);
      } catch (error) {
        console.error("Error fetching days to unstake:", error.message);
      }
    })();
  }, [address, tokenId]);

  useEffect(() => {
    (async () => {
      if (!address || !tokenId) {
        console.warn("Invalid address or tokenId:", { address, tokenId });
        return;
      }
      try {
        const munityMedals = await getNftTokenMunityMedals(address, tokenId);
        setNftTokenMunityMedals(munityMedals);
      } catch (error) {
        console.error("Error fetching Munity Medals:", error.message);
      }
    })();
  }, [address, tokenId]);

  useEffect(() => {
    (async () => {
      if (!address) return;
      try {
        const totalStaked = await getNftTotalStaked(address);
        setNftTotalStaked(totalStaked.length);
      } catch (error) {
        console.error("Error fetching total staked NFTs:", error.message);
      }
    })();
  }, [address]);

  useEffect(() => {
    setIsConnect(!isConnecting && !isDisconnected);
  }, [isConnecting, isDisconnected]);

  return (
    <div
      className="SlideModal"
      style={
        !isConnect ? { minHeight: "200px" } : { marginTop: "310px" }
      }
    >
      <StakeSettingModal
        show={modalShow}
        onHide={() => setModalShow(false)}
        onNftStake={onNftStake}
        onNftUnstake={onNftUnstake}
        stakeType={stakeType}
      />
      <div
        className="borderModal"
        style={
          !isConnect
            ? { height: "0px", width: "0px", display: "none" }
            : {}
        }
      >
        {isConnect && (
          <div className="Slide">
            <Slide contextData={fundingContextData} />
          </div>
        )}

        {isConnect && (
          <div className="Modal">
            <div className="btnGroup btnGroup1">
              <div className="ethBtn">
                <span className="iSpan">NFT Staked</span>
                <span className="cSpan">{nftTotalStaked}</span>
              </div>
              <div className="ethBtn">
                <span className="iSpan">Munity Medals</span>
                <span className="cSpan">{nftTokenMunityMedals}</span>
              </div>
              <div className="ethBtn">
                <span className="iSpan">Days to Unstake</span>
                <span className="cSpan">{daysToUnstake}</span>
              </div>
            </div>

            <div className="btnGroup btnGroup2">
              <button
                className="tabButton"
                style={{
                  background: "none",
                  color: "#BABABA",
                }}
                onClick={() => {
                  setStakeType(!currentStaked ? "nftStake" : "nftUnstake");
                  onSetModal(true);
                }}
              >
                {!currentStaked ? "Stake" : "Unstake"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
