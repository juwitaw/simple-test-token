const expectRevert = require("./helpers/expectRevert");
const SushiToken = artifacts.require('SushiToken2');

contract('SushiToken', accounts => {
  let token;

  const tokenOwner = accounts[0];
  const notTokenOwner = accounts[1];
  const mintReciever = accounts[2];

  before(async function () {
    token = await SushiToken.new({
      from: tokenOwner
    });
  });

  it('has a name', async function () {
    const name = await token.name();
    assert.equal(name, 'SushiToken');
  });

  it('has a symbol', async function () {
    const symbol = await token.symbol();
    assert.equal(symbol, 'SUSHTO');
  });

  it('has 18 decimals', async function () {
    const decimals = await token.decimals();
    assert.strictEqual(decimals.toNumber(), 18);
  });

  it('assigns the initial total supply to the creator', async function () {
    const initialSupply = await token.initialSupply();
    const totalSupply = await token.totalSupply();
    const creatorBalance = await token.balanceOf(tokenOwner);

    assert.strictEqual(creatorBalance.toString(), initialSupply.toString());
    assert.strictEqual(totalSupply.toString(), initialSupply.toString());
  });

  it('can transfer 10 token from token owner to not owner', async function () {
    const transferReciept = await token.transfer(notTokenOwner, 10, {
      from: tokenOwner
    });
    var notOwnerBalance = await token.balanceOf(notTokenOwner);

    assert.strictEqual(notOwnerBalance.toString(), "10");
  });

  describe('contract burnable', async function () {

    it('burn 10 token', async function () {
      const userTokenBefore = await token.balanceOf(tokenOwner);
      const burnReciept = await token.burn(web3.utils.toWei("10"), {
        from: tokenOwner
      });
      const userTokenAfter = await token.balanceOf(tokenOwner);
      var difference = (userTokenBefore / (10 ** 18)) - (userTokenAfter / (10 ** 18));
      assert.strictEqual(difference.toString(), "10");

      const burnLogs = burnReciept.logs;
      assert.strictEqual(burnLogs.length, 2);
      assert.strictEqual(burnLogs[0].event, "Transfer");
      assert.strictEqual(burnLogs[1].event, "BurnLog");
      assert.strictEqual(burnLogs[1].args.by, tokenOwner);
      assert.strictEqual(burnLogs[1].args.value.toString(), web3.utils.toWei("10").toString());
    });

    it('can not burn if burner doesn\'t have token', async function () {
      await expectRevert(
        token.burn(web3.utils.toWei("10"), {
          from: notTokenOwner
        }))
    });
  });

  describe('contract mintable', async function () {

    it('mint 10 token by owner', async function () {
      const userTokenBefore = await token.balanceOf(mintReciever);
      const mintReciept = await token.mint(mintReciever, web3.utils.toWei("10"), {
        from: tokenOwner
      });
      const userTokenAfter = await token.balanceOf(mintReciever);
      var difference = (userTokenAfter / (10 ** 18)) - (userTokenBefore / (10 ** 18));
      assert.strictEqual(difference.toString(), "10");

      const mintLogs = mintReciept.logs;
      assert.strictEqual(mintLogs.length, 2);
      assert.strictEqual(mintLogs[0].event, "Transfer");
      assert.strictEqual(mintLogs[1].event, "MintLog");
      assert.strictEqual(mintLogs[1].args.by, tokenOwner);
      assert.strictEqual(mintLogs[1].args.to, mintReciever);
      assert.strictEqual(mintLogs[1].args.value.toString(), web3.utils.toWei("10").toString());
    });

    it('can not mint by not owner', async function () {
      await expectRevert(
        token.mint(mintReciever, web3.utils.toWei("10"), {
          from: notTokenOwner
        }))
    });
  });

  describe('total sushi eaten', async function () {

    it('can add total sushi eaten value by sushi type', async function () {
      const addTotalReciept = await token.setTotalSushiEaten(web3.utils.fromAscii('salmon nigiri'), 5, {
        from: tokenOwner
      });

      const totalSushi = await token.totalSushiEaten(web3.utils.fromAscii('salmon nigiri'));
      assert.strictEqual(totalSushi.toString(), "5");

      const addTotalLogs = addTotalReciept.logs;
      assert.strictEqual(addTotalLogs.length, 1);
      assert.strictEqual(addTotalLogs[0].event, "SushiAdded");
      assert.strictEqual(addTotalLogs[0].args.by, tokenOwner);
      assert.strictEqual(addTotalLogs[0].args.sushiType, web3.utils.padRight(web3.utils.fromAscii('salmon nigiri'), 64));
      assert.strictEqual(addTotalLogs[0].args.totalSushi.toString(), "5");
    });
  });
});