// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require("hardhat");
const {
  promises: { readdir, readFile },
} = require("fs");

const getDirectories = async (source) =>
  (await readdir(source, { withFileTypes: true }))
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name);

const getAllContractFiles = async () => {
  try {
    const contractsFileNames = (await readdir("./../contracts")).map(
      (item) => item.split(".sol")[0]
    );

    console.log("Compiling...");
    await hre.run("compile");
    const cFactoryPromiseList = contractsFileNames.map((item) =>
      hre.ethers.getContractFactory(item)
    );

    console.log("Deploying...");
    const contractList = await Promise.all(cFactoryPromiseList);
    const deployableContracts = await Promise.all(
      contractList.map((item) => item.deploy("Some text here"))
    );

    await Promise.all(deployableContracts.map((item) => item.deployed()));
    console.log(deployableContracts.map((item) => item.address));
    console.log(
      `Deployed ${
        deployableContracts.length
      } contracts: ${contractsFileNames.join(",")}`
    );
  } catch (error) {
    console.error(error);
  }
  // const files = (
  //   await Promise.all(
  //     contractsFolder.map((item) => {
  //       const fileName = item.split("sol");
  //       return readFile(path + "" + item + "/" + fileName[0] + "json", "utf8");
  //     })
  //   )
  // ).map((item) => JSON.parse(item));
  return [];
};

async function main() {
  console.log("running main");
  getAllContractFiles();
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  // await hre.run('compile');

  // We get the contract to deploy
  // const Greeter = await hre.ethers.getContractFactory("Greeter");
  // const greeter = await Greeter.deploy("Hello, Hardhat!");

  // await greeter.deployed();

  // console.log("Greeter deployed to:", greeter.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
// main()
//   .then(() => process.exit(0))
//   .catch((error) => {
//     console.error(error);
//     process.exit(1);
//   });

main();
