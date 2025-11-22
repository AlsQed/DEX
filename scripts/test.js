const { ethers } = require("hardhat");


async function main() {
  console.log("DEX Test");

  console.log("Deploy Contracts");

  const [deployer, user1, user2] = await ethers.getSigners();
  console.log(`Deployer Address: ${deployer.address}`);
  console.log(`User1 Address: ${user1.address}`);
  console.log(`User2 Address: ${user2.address}`);

  const network = await ethers.provider.getNetwork();
  console.log(`Network: ${network.name} (Chain ID: ${network.chainId})`);
  const blockNumber = await ethers.provider.getBlockNumber();
  console.log(`Current Block: ${blockNumber}\n`);

  const supply = ethers.parseUnits("1000000", 18);
  const TestToken = await ethers.getContractFactory("TestToken");
  
  console.log("Deploy TokenA (TKA)...");
  const tokenA = await TestToken.deploy("TokenA", "TKA", supply);
  await tokenA.waitForDeployment();
  const tokenAAddress = await tokenA.getAddress();
  console.log(`TokenA Deployed: ${tokenAAddress}`);

  console.log("Deploy TokenB (TKB)...");
  const tokenB = await TestToken.deploy("TokenB", "TKB", supply);
  await tokenB.waitForDeployment();
  const tokenBAddress = await tokenB.getAddress();
  console.log(`TokenB Deployed: ${tokenBAddress}`);

  console.log("Deploy DEX Contract...");
  const DEX = await ethers.getContractFactory("DEX");
  const dex = await DEX.deploy(tokenAAddress, tokenBAddress);
  await dex.waitForDeployment();
  const dexAddress = await dex.getAddress();
  console.log(`DEX Deployed: ${dexAddress}`);

  const lpTokenAddress = await dex.lpToken();
  const lpToken = await ethers.getContractAt("LPToken", lpTokenAddress);
  console.log(`LP Token Address: ${lpTokenAddress}\n`);

  console.log("Mint Tokens");

  const transferAmount = ethers.parseUnits("10000", 18);
  
  console.log(`Transfer ${ethers.formatEther(transferAmount)} TKA from Deployer to User1...`);
  await (await tokenA.transfer(user1.address, transferAmount)).wait();
  console.log(`Transfer Success`);

  console.log(`Transfer ${ethers.formatEther(transferAmount)} TKB from Deployer to User1...`);
  await (await tokenB.transfer(user1.address, transferAmount)).wait();
  console.log(`Transfer Success`);

  console.log(`Transfer ${ethers.formatEther(transferAmount)} TKA from Deployer to User2...`);
  await (await tokenA.transfer(user2.address, transferAmount)).wait();
  console.log(`Transfer Success`);

  console.log(`Transfer ${ethers.formatEther(transferAmount)} TKB from Deployer to User2...`);
  await (await tokenB.transfer(user2.address, transferAmount)).wait();
  console.log(`Transfer Success\n`);

  const deployerBalanceA = await tokenA.balanceOf(deployer.address);
  const deployerBalanceB = await tokenB.balanceOf(deployer.address);
  const user1BalanceA = await tokenA.balanceOf(user1.address);
  const user1BalanceB = await tokenB.balanceOf(user1.address);
  const user2BalanceA = await tokenA.balanceOf(user2.address);
  const user2BalanceB = await tokenB.balanceOf(user2.address);

  console.log("Current Balances:");
  console.log(`  Deployer: ${ethers.formatEther(deployerBalanceA)} TKA, ${ethers.formatEther(deployerBalanceB)} TKB`);
  console.log(`  User1:  ${ethers.formatEther(user1BalanceA)} TKA, ${ethers.formatEther(user1BalanceB)} TKB`);
  console.log(`  User2:  ${ethers.formatEther(user2BalanceA)} TKA, ${ethers.formatEther(user2BalanceB)} TKB\n`);

  console.log("Add Liquidity");
  const liquidityAmount0 = ethers.parseUnits("5000", 18);
  const liquidityAmount1 = ethers.parseUnits("5000", 18);

  console.log(`Deployer Add Initial Liquidity: ${ethers.formatEther(liquidityAmount0)} TKA + ${ethers.formatEther(liquidityAmount1)} TKB`);
  
  await (await tokenA.connect(deployer).approve(dexAddress, ethers.MaxUint256)).wait();
  await (await tokenB.connect(deployer).approve(dexAddress, ethers.MaxUint256)).wait();
  console.log("Approval Success");

  console.log("Add Liquidity");
  const addLiquidityTx = await dex.connect(deployer).addLiquidity(liquidityAmount0, liquidityAmount1);
  const addLiquidityReceipt = await addLiquidityTx.wait();
  const addLiquidityEvent = addLiquidityReceipt.logs.find(
    log => log.fragment && log.fragment.name === "LiquidityAdded"
  );
  const lpMinted = addLiquidityEvent ? ethers.formatEther(addLiquidityEvent.args[2]) : "N/A";
  console.log(`Liquidity Added Success, LP Token: ${lpMinted}`);

  const reserve0 = await dex.reserve0();
  const reserve1 = await dex.reserve1();
  console.log(`Pool Reserves: ${ethers.formatEther(reserve0)} TKA, ${ethers.formatEther(reserve1)} TKB`);

  const deployerLPBalance = await lpToken.balanceOf(deployer.address);
  console.log(`Deployer LP Token Balance: ${ethers.formatEther(deployerLPBalance)}\n`);

  console.log(`User1 Add Liquidity: ${ethers.formatEther(liquidityAmount0)} TKA + ${ethers.formatEther(liquidityAmount1)} TKB`);
  await (await tokenA.connect(user1).approve(dexAddress, ethers.MaxUint256)).wait();
  await (await tokenB.connect(user1).approve(dexAddress, ethers.MaxUint256)).wait();
  const addLiquidityTx2 = await dex.connect(user1).addLiquidity(liquidityAmount0, liquidityAmount1);
  const addLiquidityReceipt2 = await addLiquidityTx2.wait();
  const addLiquidityEvent2 = addLiquidityReceipt2.logs.find(
    log => log.fragment && log.fragment.name === "LiquidityAdded"
  );
  const lpMinted2 = addLiquidityEvent2 ? ethers.formatEther(addLiquidityEvent2.args[2]) : "N/A";
  console.log(`Liquidity Added Success, LP Token: ${lpMinted2}`);

  const reserve0After = await dex.reserve0();
  const reserve1After = await dex.reserve1();
  console.log(`Pool Reserves: ${ethers.formatEther(reserve0After)} TKA, ${ethers.formatEther(reserve1After)} TKB\n`);

  console.log("Swap");

  const swapAmountIn = ethers.parseUnits("100", 18);
  console.log(`User2 Swap ${ethers.formatEther(swapAmountIn)} TKA for TKB`);

  await (await tokenA.connect(user2).approve(dexAddress, ethers.MaxUint256)).wait();
  console.log("Approval Success");

  const expectedAmountOut = await dex.getAmountOut(swapAmountIn, tokenAAddress);
  console.log(`Expected Output: ${ethers.formatEther(expectedAmountOut)} TKB`);

  const minAmountOut = (expectedAmountOut * 95n) / 100n;
  console.log(`Minimum Output (Slippage Protection): ${ethers.formatEther(minAmountOut)} TKB`);

  const user2BalanceABefore = await tokenA.balanceOf(user2.address);
  const user2BalanceBBefore = await tokenB.balanceOf(user2.address);
  console.log(`Before Swap Balance: ${ethers.formatEther(user2BalanceABefore)} TKA, ${ethers.formatEther(user2BalanceBBefore)} TKB`);

  const swapTx = await dex.connect(user2).swapExactTokensForTokens(
    tokenAAddress,
    swapAmountIn,
    minAmountOut,
    user2.address
  );
  const swapReceipt = await swapTx.wait();
  const swapEvent = swapReceipt.logs.find(
    log => log.fragment && log.fragment.name === "Swapped"
  );
  
  if (swapEvent) {
    const actualAmountOut = swapEvent.args[4];
    console.log(`Swap Success, Actual Output: ${ethers.formatEther(actualAmountOut)} TKB`);
  } else {
    console.log(`Swap Success`);
  }

  const user2BalanceAAfter = await tokenA.balanceOf(user2.address);
  const user2BalanceBAfter = await tokenB.balanceOf(user2.address);
  console.log(`After Swap Balance: ${ethers.formatEther(user2BalanceAAfter)} TKA, ${ethers.formatEther(user2BalanceBAfter)} TKB`);

  const tokenASpent = user2BalanceABefore - user2BalanceAAfter;
  const tokenBReceived = user2BalanceBAfter - user2BalanceBBefore;
  console.log(`Actual Change: Spend ${ethers.formatEther(tokenASpent)} TKA, Receive ${ethers.formatEther(tokenBReceived)} TKB`);
  
  const reserve0AfterSwap = await dex.reserve0();
  const reserve1AfterSwap = await dex.reserve1();
  console.log(`After Swap Pool Reserves: ${ethers.formatEther(reserve0AfterSwap)} TKA, ${ethers.formatEther(reserve1AfterSwap)} TKB\n`);

  console.log("Remove Liquidity");

  const user1LPBalance = await lpToken.balanceOf(user1.address);
  const removeLPAmount = user1LPBalance / 2n;
  console.log(`User1 Remove ${ethers.formatEther(removeLPAmount)} LP Token (Total: ${ethers.formatEther(user1LPBalance)})`);

  const user1BalanceABeforeRemove = await tokenA.balanceOf(user1.address);
  const user1BalanceBBeforeRemove = await tokenB.balanceOf(user1.address);
  console.log(`Before Remove Balance: ${ethers.formatEther(user1BalanceABeforeRemove)} TKA, ${ethers.formatEther(user1BalanceBBeforeRemove)} TKB`);

  const removeLiquidityTx = await dex.connect(user1).removeLiquidity(removeLPAmount);
  const removeLiquidityReceipt = await removeLiquidityTx.wait();
  const removeLiquidityEvent = removeLiquidityReceipt.logs.find(
    log => log.fragment && log.fragment.name === "LiquidityRemoved"
  );

  if (removeLiquidityEvent) {
    const amount0Out = removeLiquidityEvent.args[0];
    const amount1Out = removeLiquidityEvent.args[1];
    console.log(`Remove Liquidity Success, Received: ${ethers.formatEther(amount0Out)} TKA, ${ethers.formatEther(amount1Out)} TKB`);
  } else {
    console.log(`Remove Liquidity Success`);
  }

  const user1BalanceAAfterRemove = await tokenA.balanceOf(user1.address);
  const user1BalanceBAfterRemove = await tokenB.balanceOf(user1.address);
  console.log(`After Remove Balance: ${ethers.formatEther(user1BalanceAAfterRemove)} TKA, ${ethers.formatEther(user1BalanceBAfterRemove)} TKB`);

  const tokenAReceived = user1BalanceAAfterRemove - user1BalanceABeforeRemove;
  const tokenBReceivedFromLP = user1BalanceBAfterRemove - user1BalanceBBeforeRemove;
  console.log(`Actual Change: Receive ${ethers.formatEther(tokenAReceived)} TKA, ${ethers.formatEther(tokenBReceivedFromLP)} TKB`);

  const reserve0AfterRemove = await dex.reserve0();
  const reserve1AfterRemove = await dex.reserve1();
  console.log(`After Remove Pool Reserves: ${ethers.formatEther(reserve0AfterRemove)} TKA, ${ethers.formatEther(reserve1AfterRemove)} TKB\n`);

  console.log("Check Final Balances");
  const finalDeployerBalanceA = await tokenA.balanceOf(deployer.address);
  const finalDeployerBalanceB = await tokenB.balanceOf(deployer.address);
  const finalDeployerLP = await lpToken.balanceOf(deployer.address);
  const finalDeployerETH = await ethers.provider.getBalance(deployer.address);

  const finalUser1BalanceA = await tokenA.balanceOf(user1.address);
  const finalUser1BalanceB = await tokenB.balanceOf(user1.address);
  const finalUser1LP = await lpToken.balanceOf(user1.address);
  const finalUser1ETH = await ethers.provider.getBalance(user1.address);

  const finalUser2BalanceA = await tokenA.balanceOf(user2.address);
  const finalUser2BalanceB = await tokenB.balanceOf(user2.address);
  const finalUser2LP = await lpToken.balanceOf(user2.address);
  const finalUser2ETH = await ethers.provider.getBalance(user2.address);

  const finalReserve0 = await dex.reserve0();
  const finalReserve1 = await dex.reserve1();

  console.log("Final Balances Summary:");
  console.log("\nDeployer:");
  console.log(`  ETH:  ${ethers.formatEther(finalDeployerETH)}`);
  console.log(`  TKA:  ${ethers.formatEther(finalDeployerBalanceA)}`);
  console.log(`  TKB:  ${ethers.formatEther(finalDeployerBalanceB)}`);
  console.log(`  LP:   ${ethers.formatEther(finalDeployerLP)}`);

  console.log("\nUser1:");
  console.log(`  ETH:  ${ethers.formatEther(finalUser1ETH)}`);
  console.log(`  TKA:  ${ethers.formatEther(finalUser1BalanceA)}`);
  console.log(`  TKB:  ${ethers.formatEther(finalUser1BalanceB)}`);
  console.log(`  LP:   ${ethers.formatEther(finalUser1LP)}`);

  console.log("\nUser2:");
  console.log(`  ETH:  ${ethers.formatEther(finalUser2ETH)}`);
  console.log(`  TKA:  ${ethers.formatEther(finalUser2BalanceA)}`);
  console.log(`  TKB:  ${ethers.formatEther(finalUser2BalanceB)}`);
  console.log(`  LP:   ${ethers.formatEther(finalUser2LP)}`);

  console.log("\nLiquidity Pool:");
  console.log(`  TKA:  ${ethers.formatEther(finalReserve0)}`);
  console.log(`  TKB:  ${ethers.formatEther(finalReserve1)}`);

  console.log("\nTest Summary:");
  console.log("All Steps Executed Successfully");
  console.log("\nContract Addresses:");
  console.log(`  DEX:        ${dexAddress}`);
  console.log(`  TokenA:     ${tokenAAddress}`);
  console.log(`  TokenB:     ${tokenBAddress}`);
  console.log(`  LP Token:   ${lpTokenAddress}\n`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\nTest Failed:", error);
    process.exit(1);
  });

