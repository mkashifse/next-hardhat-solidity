// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require("hardhat");
const {
  promises: { readdir, readFile, writeFile },
} = require("fs");

const compileAndDeployAllContracts = async () => {
  try {
    const contractsFileNames = (await readdir("./../hardhat/contracts")).map(
      (item) => item.split(".sol")[0]
    );

    console.log("Compiling...");
    await hre.run("compile");
    const cFactoryPromiseList = contractsFileNames.map((item) =>
      hre.ethers.getContractFactory(item)
    );

    console.log("Deploying...");
    const Contracts = await Promise.all(cFactoryPromiseList);
    const contractInstances = await Promise.all(
      Contracts.map((item) => item.deploy("Some text here"))
    );


    // await Promise.all(contractInstances.map((item) => item.deployed()));
    const addrs = contractInstances.map((item) => item.address);
    console.log(
      `Deployed ${
        contractInstances.length
      } contracts: ${contractsFileNames.join(",")}`,
      addrs
    );
    writeFile(
      "./../contractsAddresses.json",
      JSON.stringify(addrs),
      "utf8",
      (err, resp) => {
        if (err) console.error(err);
        else console.log(resp);
      }
    );
  } catch (error) {
    console.error(error);
  }
};

compileAndDeployAllContracts();
