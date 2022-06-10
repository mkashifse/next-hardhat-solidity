import { useState } from "react";
import { useForm } from "react-hook-form";
import useWeb3 from "./useWeb3";
import { toast } from "react-toastify";

const CText = (props) => {
  const { register, ...others } = props;
  return (
    <input
      {...others}
      {...register(props.name)}
      className="text-sm p-2 px-4 rounded border w-full"
    ></input>
  );
};

const CButton = (props) => {
  return (
    <button
      type="submit"
      {...props}
      className="rounded px-3 p-2 h-full bg-indigo-400 w-full text-white text-sm shadow shadow-indigo-300"
    >
      {props.children}
    </button>
  );
};

const useContractForm = () => {
  const { register, handleSubmit } = useForm();
  const [formMap, setFormMap] = useState({});
  const [blocks, setBlocks] = useState([]);
  const [allTransactions, setAllTransactions] = useState([]);

  const { getMethod, useConnect } = useWeb3();

  const Inputs = ({ inputs, register, fieldName }) => {
    if (inputs.length) {
      return inputs.map((item, i) => (
        <CText
          key={i + fieldName}
          placeholder={item.name}
          name={fieldName}
          register={register}
        ></CText>
      ));
    }
  };

  const Outputs = ({ outputs, register, fieldName, value }) => {
    if (outputs.length) {
      return outputs.map((item, i) => (
        <CText
          key={i + value}
          disabled
          placeholder={fieldName}
          name={fieldName}
          register={register}
          value={value}
        ></CText>
      ));
    }
  };

  const onSubmit = (data, event) => {
    const buttonClicked = event.nativeEvent.submitter.name;
    const { contract, web3 } = window["web3Obj"];
    getMethod(contract, buttonClicked, data[buttonClicked])
      .then(async (resp) => {
        toast(
          `${buttonClicked} is executed successfully.!`,
          `Contract Function Success Call`
        );
        setFormMap({
          ...formMap,
          [buttonClicked]: resp,
        });

        const earliest = await web3.eth.getBlock("earliest");
        const latest = await web3.eth.getBlock("latest");
        const blocksPromises = [];
        for (let b = earliest.number; b < latest.number; b++) {
          blocksPromises.push(web3.eth.getBlock(b));
        }

        const blcks = await Promise.all(blocksPromises);
        setBlocks(blcks);

        const trx = await Promise.all(
          blcks
            .flatMap((item) => item.transactions)
            .map((block) => web3.eth.getTransaction(block))
        );

        setAllTransactions(trx);

        console.log(trx.map((item) => web3.utils.hexToAscii(item.input)));
        console.log(blcks, trx);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const ContractForm = ({ abi }) => {
    return (
      <form onSubmit={handleSubmit(onSubmit)} className="m-auto">
        <div className=" divide-y">
          {abi.map((item, i) => {
            if (item.name) {
              return (
                <div
                  className="flex m-auto py-2 gap-2 w-full"
                  key={i + item.name}
                >
                  <div className="w-1/3">
                    <CButton name={item.name}>{item.name}</CButton>
                  </div>

                  <div className="w-2/3 flex">
                    {Inputs({
                      inputs: item.inputs,
                      register,
                      fieldName: item.name,
                    })}
                    {Outputs({
                      outputs: item.outputs,
                      register,
                      fieldName: item.name,
                      value: formMap[item.name],
                    })}
                  </div>
                </div>
              );
            }
          })}
        </div>
      </form>
    );
  };

  return {
    ContractForm,
    blocks,
    allTransactions,
  };
};

export { useContractForm, CButton, CText };
