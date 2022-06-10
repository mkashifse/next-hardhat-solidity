import Head from "next/head";
import { useEffect, useState } from "react";
import useWeb3 from "./components/useWeb3";
import { ToastContainer, toast } from "react-toastify";
import { useContractForm } from "./components/ContractForm";

export const getStaticProps = async () => {
  const { contracts: contractsArtifacts } = await fetch(
    "http://localhost:3000/api/contracts"
  ).then((resp) => resp.json());
  return {
    props: {
      contractsArtifacts,
    },
  };
};

export default function Home({ contractsArtifacts }) {
  const [selectedContractArtifact] = contractsArtifacts;
  const { getMethod, useConnect } = useWeb3();
  const { init, web3 } = useConnect();
  const { ContractForm } = useContractForm();

  const [accounts, setAccounts] = useState([]);
  const [contract, setContract] = useState([]);
  const [connectedWallet, setConnectedWallet] = useState("");

  useEffect(() => {
    init(async ({ getAccountsAsync, connectWalletAsync, Contract }) => {
      const accs = await getAccountsAsync();
      const wallets = await connectWalletAsync();
      const cont = new Contract(
        selectedContractArtifact.abi,
        "0x5FbDB2315678afecb367f032d93F642f64180aa3"
      );
      window.web3Obj = {
        ...window.web3Obj,
        defaultAccount: wallets[0],
        contract: cont,
      };
      setContract(cont);
      setAccounts(accs);
      setConnectedWallet(wallets[0]);

      const earliest = await web3.eth.getBlock("earliest");
      const latest = await web3.eth.getBlock("latest");
      console.log(earliest.number, latest.number);
      web3.eth.subscribe(
        "logs",
        {
          fromBlock: earliest.number,
        },
        (err, log) => {
          console.log(err, log);
        }
      );
    });
  }, []);

  return (
    <div>
      <ToastContainer></ToastContainer>
      <div className="flex divide-x h-screen">
        <div>{connectedWallet}</div>
        <div>
          {contractsArtifacts.map((item, i) => (
            <div key={i}>{item.contractName}</div>
          ))}
        </div>
        <div className="p-4 ">
          <ContractForm abi={selectedContractArtifact.abi}></ContractForm>
        </div>
        <div></div>
      </div>
    </div>
  );
}
