const Election = artifacts.require("Election");

module.exports = function (deployer) {
  deployer.deploy(Election, "Elections").then(
    () => console.log(Election.address)
  );
};
