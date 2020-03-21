const SashimiToken = artifacts.require("SashimiToken");

const expectRevert = require("./helpers/expectRevert");

contract("SashimiToken", accounts => {
  let token;
  const creator = accounts[0];
  const minter = accounts[1];
  const burner = accounts[2];
  const notOwner = accounts[3];
  const mintPause = accounts[4];
  const notMintPause = accounts[5];

  before(async function() {
    // deploy token contract
    token = await SashimiToken.new({ from: creator, gas: 4700000 });
  });

  it("has a name", async function() {
    const name = await token.name();
    assert.equal(name, "SashimiToken");
  });

  it("has a symbol", async function() {
    const symbol = await token.symbol();
    assert.equal(symbol, "SASHTOKEN");
  });

  it("has 18 decimals", async function() {
    const decimals = await token.decimals();
    assert.strictEqual(decimals.toNumber(), 18);
  });

  it("has Network ID", async function() {
    const networkId = await token.NETWORK_ID();
    assert.strictEqual(networkId.toNumber(), 2);
  });

  it("assure initial supply is 0", async function() {
    const totalSupply = await token.totalSupply();
    const creatorBalance = await token.balanceOf(creator);

    assert.strictEqual(creatorBalance.toString(), totalSupply.toString());
    assert.strictEqual(totalSupply.toNumber(), 0);
  });

  describe("contract is mintable and burnable", async function() {
    before(async function() {
      // initial transfer token
      await token.mint(creator, web3.utils.toWei("500"), { from: creator });
    });

    it("transfer 10 token to burner", async function() {
      // creator balance = 10000
      // burner balance = 50
      var transferTx = await token.transfer(burner, web3.utils.toWei("50"), {
        from: creator
      });
      const userToken = await token.balanceOf(burner);
      assert.strictEqual(
        userToken.toString(),
        (50 * Math.pow(10, 18)).toString()
      );

      var transferLog = transferTx.logs[0];
      assert.strictEqual(transferLog.event, "Transfer");
      assert.strictEqual(transferLog.args.from, creator);
      assert.strictEqual(transferLog.args.to, burner);
      assert.strictEqual(
        transferLog.args.value.toString(),
        (50 * Math.pow(10, 18)).toString()
      );
    });

    it("burn 20 token and mint the same amount for account[0]", async function() {
      await token.transfer(burner, web3.utils.toWei("50"), { from: creator });

      // burn 20 token
      var receipt = await token.burnToken(
        web3.utils.toWei("20"),
        "1this is tes",
        { from: burner }
      );
      const logs = receipt.logs;
      const afterBurn = await token.balanceOf(burner);
      assert.strictEqual(
        afterBurn.toString(),
        web3.utils.toWei("80").toString()
      );
      assert.strictEqual(logs.length, 3);
      assert.strictEqual(logs[2].event, "BurnLog");
      assert.strictEqual(logs[2].args.__length__, 5);
      assert.strictEqual(
        logs[2].args.burner.toLowerCase(),
        burner.toLowerCase()
      );
      assert.strictEqual(
        logs[2].args.value.toString(),
        web3.utils.toWei("20").toString()
      );
      assert.strictEqual(logs[2].args.data, "1this is tes");

      var mintTx = await token.mintToken(
        logs[2].args.id.valueOf(),
        logs[2].args.burner,
        logs[2].args.value.valueOf(),
        logs[2].args.hashDetails,
        2,
        { from: creator }
      );
      const afterMint = await token.balanceOf(burner);
      var mintLogs = mintTx.logs;

      assert.strictEqual(Object.keys(mintLogs).length, 2);
      assert.strictEqual(mintLogs[1].event, "MintLog");
      assert.strictEqual(
        mintLogs[1].args.id.toString(),
        logs[2].args.id.valueOf().toString()
      );
      assert.strictEqual(
        logs[2].args.burner.toLowerCase(),
        burner.toLowerCase()
      );
      assert.strictEqual(
        logs[2].args.value.toString(),
        web3.utils.toWei("20").toString()
      );
      assert.strictEqual(logs[2].args.hashDetails, logs[2].args.hashDetails);
      assert.strictEqual(logs[2].args.data, "1this is tes");

      assert.strictEqual(
        afterMint.toString(),
        web3.utils.toWei("100").toString()
      );
    });

    it("minted by minter instead of creator", async function() {
      await token.addMinter(minter, { from: creator });
      const allowedMinter = await token.isMinter(minter);
      assert.strictEqual(allowedMinter, true);

      await token.transfer(burner, web3.utils.toWei("50"), { from: creator });
      var receiptBurn = await token.burnToken(
        web3.utils.toWei("20"),
        "1this is tes",
        { from: burner }
      );
      const logsBurn = receiptBurn.logs;
      const receiptMint = await token.mintToken(
        logsBurn[2].args.id.valueOf(),
        logsBurn[2].args.burner,
        logsBurn[2].args.value.valueOf(),
        logsBurn[2].args.hashDetails,
        2,
        { from: minter }
      );
      const logsMint = receiptMint.logs;
      assert.strictEqual(logsMint[1].args.status, true);
    });
  });

  describe("mint can be pause", async function() {
    it("set mint pause address by token owner", async function() {
      var receipt = await token.setMintPauseAddress(mintPause, {
        from: creator
      });
      var newMintPauseAddress = await token.mintPauseAddress();
      var log = receipt.logs[0];
      assert.strictEqual(newMintPauseAddress, mintPause);
      assert.strictEqual(log.event, "MintPauseChangedLog");
      assert.strictEqual(log.args.mintPauseAddress, mintPause);
      assert.strictEqual(log.args.by, creator);
    });

    it("can not set mint pause address by not token owner", async function() {
      await expectRevert(
        token.setMintPauseAddress(notMintPause, { from: notOwner })
      );
      var newMintPauseAddress = await token.mintPauseAddress();
      assert.strictEqual(newMintPauseAddress, mintPause);
      assert.notEqual(newMintPauseAddress, notMintPause);
    });

    it("set mint pause status by mint pause address", async function() {
      var receipt = await token.setIsMintPause(true, { from: mintPause });
      var newMintPauseStatus = await token.isMintPause();
      var log = receipt.logs[0];
      assert.strictEqual(newMintPauseStatus, true);
      assert.strictEqual(log.event, "MintPauseChangedLog");
      assert.strictEqual(log.args.status, true);
      assert.strictEqual(log.args.by, mintPause);
    });

    it("can not set mint pause status by not mint pause address", async function() {
      await expectRevert(token.setIsMintPause(false, { from: creator }));
      var newMintPauseStatus = await token.isMintPause();
      assert.strictEqual(newMintPauseStatus, true);
      assert.notEqual(newMintPauseStatus, false);
    });

    it("can not mint when mint pause status is true", async function() {
      var receiptBurn = await token.burnToken(
        web3.utils.toWei("25"),
        "1this is tes",
        { from: burner }
      );
      const logsBurn = receiptBurn.logs;

      var before = await token.balanceOf(burner);
      await expectRevert(
        token.mintToken(
          logsBurn[2].args.id.valueOf(),
          logsBurn[2].args.burner,
          logsBurn[2].args.value.valueOf(),
          logsBurn[2].args.hashDetails,
          2,
          { from: minter }
        )
      );
      var after = await token.balanceOf(burner);
      assert.strictEqual(before.toString(), after.toString());
    });
  });
});
