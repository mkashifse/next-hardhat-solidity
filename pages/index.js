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
  const { ContractForm, reset } = useContractForm();

  const [contractsArtifacts, setContractsArtifacts] = useState([]);
  const [selectedContractArtifact, setSelectedContractArtifact] =
    useState(null);

  const [selectedConttractAddress, setSelectedConttractAddress] = useState();

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
    setSelectedConttractAddress(contractAddresses[0]);
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
          selectedConttractAddress,
          {
            from: wallets[0],
            gasPrice: "20000000000",
          }
        );
        window.web3Obj = {
          ...window.web3Obj,
          defaultAccount: wallets[0],
          contractAddress: selectedConttractAddress,
          contract: cont,
        };
        setContract(cont);
        setAccounts(accs);
        setConnectedWallet(wallets[0]);

        console.log(selectedContractArtifact);

        const earliest = await web3.eth.getBlock("earliest");
        const latest = await web3.eth.getBlock("latest");

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

  const onSelectContract = (index) => {
    setSelectedContractArtifact(contractsArtifacts[index]);
    setSelectedConttractAddress(contractAddresses[index]);

    const fields = contractsArtifacts[index].abi
      .map((item) => item.name)
      .filter((e) => e)
      .reduce((prev, curr) => ({ ...prev, [curr]: "" }), {});
    reset(fields);
  };

  return (
    <div>
      <ToastContainer></ToastContainer>
      <div className="border p-2 border-b flex justify-between text-sm">
        <div className="w-[320px]">
          <Select
            css="w-full"
            onChange={({ target }) => onSelectContract(target.value)}
          >
            {contractsArtifacts.map((item, i) => (
              <option value={i}>{item.contractName}</option>
            ))}
          </Select>
          <p className="text-slate-600 font-semibold">
            {selectedConttractAddress}
          </p>
        </div>
        <div>
          <div className="flex justify-end space-x-3">
            <Button onClick={() => onDeploy()}>Deploy</Button>
            <Button onClick={() => onDeploy()} css="w-[203px]">
              Connect
            </Button>
          </div>
          <div className="text-right text-slate-500 font-semibold">
            {connectedWallet}
          </div>
        </div>
      </div>
      <div className="flex divide-x h-screen p-4">
        <div className="p-4 flex-grow">
          {selectedContractArtifact && (
            <ContractForm abi={selectedContractArtifact.abi}></ContractForm>
          )}
        </div>
      </div>
    </div>
  );
}
