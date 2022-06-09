import Head from "next/head";
import { useEffect, useState } from "react";
import useWeb3 from "./components/useWeb3";
import { ToastContainer, toast } from "react-toastify";
import { ContractForm } from "./components/ContractForm";

export const getStaticProps = async () => {
  const { contracts } = await fetch("http://localhost:3000/api/contracts").then(
    (resp) => resp.json()
  );
  return {
    props: {
      contracts,
    },
  };
};

export default function Home({ contracts }) {
  const [selectedContractArtifact] = contracts;
  const { getMethod, useConnect } = useWeb3();
  const { init } = useConnect();

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
      setContract(cont);
      setAccounts(accs);
      setConnectedWallet(wallets[0]);
    });
  }, []);

  return (
    <div className="text-red-600">
      <ToastContainer></ToastContainer>
      <ContractForm
        abi={selectedContractArtifact.abi}
        contract={contract}
      ></ContractForm>
    </div>
  );
}
