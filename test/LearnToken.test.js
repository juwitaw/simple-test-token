const expectRevert = require("./helpers/expectRevert");
const LearnToken = artifacts.require('LearnToken');

contract('LearnToken', accounts => {
  let token;

  const tokenOwner = accounts[0];
  const notTokenOwner = accounts[1];
  const mintReciever = accounts[2];

  before(async function () {
    token = await LearnToken.new({ from: tokenOwner });
  });

  it('has a name', async function () {
    const name = await token.name();
    assert.equal(name, 'LearnToken');
  });

  it('has a symbol', async function () {
    const symbol = await token.symbol();
    assert.equal(symbol, 'LT');
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
    const transferReciept = await token.transfer(notTokenOwner, 10, {from:tokenOwner});
    var notOwnerBalance = await token.balanceOf(notTokenOwner);

    assert.strictEqual(notOwnerBalance.toString(), "10");
  });

  describe('contract burnable', async function (){

    it('burn 10 token', async function () {
      const userTokenBefore = await token.balanceOf(tokenOwner);
      const burnReciept = await token.burn(web3.utils.toWei("10"), {from: tokenOwner});
      const userTokenAfter = await token.balanceOf(tokenOwner);
      var difference = (userTokenBefore/(10**18)) - (userTokenAfter/(10**18));
      assert.strictEqual(difference.toString(), "10");

      const burnLogs = burnReciept.logs;
      assert.strictEqual(burnLogs.length, 2);
      assert.strictEqual(burnLogs[0].event, "Transfer");
      assert.strictEqual(burnLogs[1].event, "BurnLog");
      assert.strictEqual(burnLogs[1].args.by, tokenOwner);
      assert.strictEqual(burnLogs[1].args.value.toString(), web3.utils.toWei("10").toString());
    });

    it('can not burn if burner doesn\'t have token', async function () {
      await expectRevert(token.burn(web3.utils.toWei("10"), {from: notTokenOwner}))
    });
  });

  describe('contract mintable', async function (){

    it('mint 10 token by owner', async function () {
      
    });

    it('can not mint by not owner', async function () {
      
    });
  });
});