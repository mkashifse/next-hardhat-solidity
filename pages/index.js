import Head from "next/head";
import { useEffect, useState } from "react";
import useWeb3 from "./components/useWeb3";
import { ToastContainer, toast } from "react-toastify";
import { useContractForm } from "./components/ContractForm";
import { Button, Input, Select } from "./components/kit";

const fetchContracts = async (fetchOnly = true) => {
  const resp = await fetch(
    `http://localhost:3000/api/contracts?fetchOnly=${fetchOnly}`
  ).then((resp) => resp.json());
  return resp;
};

export const getStaticProps = async () => {
  const { artifacts, addresses } = await fetchContracts();
  return {
    props: {
      artifacts,
      contractAddresses: JSON.parse(addresses),
    },
  };
};

export default function Home({ artifacts, contractAddresses }) {
  const { getMethod, useConnect } = useWeb3();
  const { init, web3 } = useConnect();
  const { ContractForm } = useContractForm();

  const [contractsArtifacts, setContractsArtifacts] = useState([]);
  const [selectedContractArtifact, setSelectedContractArtifact] =
    useState(null);
  const [isLoadingArtifacts, setIsLoadingArtifacts] = useState(false);

  const [accounts, setAccounts] = useState([]);
  const [contract, setContract] = useState([]);
  const [connectedWallet, setConnectedWallet] = useState("");
  const [addresses, setAddresses] = useState([]);

  const onDeploy = async () => {
    setIsLoadingArtifacts(true);
    const { artifacts, addresses } = await fetchContracts(false);
    setContractsArtifacts(artifacts);
    setSelectedContractArtifact(artifacts[0]);
    setIsLoadingArtifacts(false);
    setAddresses(JSON.parse(addresses));
  };

  useEffect(() => {
    setAddresses(contractAddresses);
    setContractsArtifacts(artifacts);
    setSelectedContractArtifact(artifacts[0]);
  }, []);

  useEffect(() => {
    if (selectedContractArtifact)
      init(async ({ getAccountsAsync, connectWalletAsync, Contract }) => {
        const accs = await getAccountsAsync();
        const wallets = await connectWalletAsync();
        const cont = new Contract(
          selectedContractArtifact.abi,
          contractAddresses[0],
          {
            from: wallets[0],
            gasPrice: "20000000000",
          }
        );
        window.web3Obj = {
          ...window.web3Obj,
          defaultAccount: wallets[0],
          contractAddress: contractAddresses[0],
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
  }, [selectedContractArtifact]);

  return (
    <div>
      <ToastContainer></ToastContainer>
      <div className="border p-2 border-b flex justify-between text-sm">
        <div>
          <Input></Input>
          <Select>
            <option>Salam</option>
          </Select>
        </div>
        <div>
          <Button onClick={() => onDeploy()}>Deploy</Button>
        </div>
      </div>
      <div>{connectedWallet}</div>
      <div className="flex divide-x h-screen p-4">
        <div>
          {contractsArtifacts &&
            contractsArtifacts.length &&
            contractsArtifacts.map((item, i) => (
              <div key={i}>
                {item.contractName} - {addresses[i]}
              </div>
            ))}
        </div>
        <div className="p-4 flex-grow">
          {selectedContractArtifact && (
            <ContractForm abi={selectedContractArtifact.abi}></ContractForm>
          )}
        </div>
        <div></div>
      </div>
    </div>
  );
}
