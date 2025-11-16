// 部署后自动更新配置文件
const fs = require('fs');
const path = require('path');

async function main() {
  // 读取部署信息（假设从环境变量或文件获取）
  const dexAddress = process.env.DEX_ADDRESS;
  const token0Address = process.env.TOKEN0_ADDRESS;
  const token1Address = process.env.TOKEN1_ADDRESS;
  const lpTokenAddress = process.env.LP_TOKEN_ADDRESS;
  
  if (!dexAddress) {
    console.log('No DEX_ADDRESS found. Please set environment variables or update server/config.js manually.');
    return;
  }
  
  const configPath = path.join(__dirname, '../server/config.js');
  let configContent = fs.readFileSync(configPath, 'utf8');
  
  // 更新合约地址
  if (dexAddress) {
    configContent = configContent.replace(
      /DEX: process\.env\.DEX_ADDRESS \|\| '[^']*'/,
      `DEX: process.env.DEX_ADDRESS || '${dexAddress}'`
    );
  }
  
  if (token0Address) {
    configContent = configContent.replace(
      /Token0: process\.env\.TOKEN0_ADDRESS \|\| '[^']*'/,
      `Token0: process.env.TOKEN0_ADDRESS || '${token0Address}'`
    );
  }
  
  if (token1Address) {
    configContent = configContent.replace(
      /Token1: process\.env\.TOKEN1_ADDRESS \|\| '[^']*'/,
      `Token1: process.env.TOKEN1_ADDRESS || '${token1Address}'`
    );
  }
  
  if (lpTokenAddress) {
    configContent = configContent.replace(
      /LPToken: process\.env\.LP_TOKEN_ADDRESS \|\| '[^']*'/,
      `LPToken: process.env.LP_TOKEN_ADDRESS || '${lpTokenAddress}'`
    );
  }
  
  fs.writeFileSync(configPath, configContent);
  console.log('✅ Configuration updated successfully!');
  console.log('Contract addresses:');
  console.log(`  DEX: ${dexAddress}`);
  if (token0Address) console.log(`  Token0: ${token0Address}`);
  if (token1Address) console.log(`  Token1: ${token1Address}`);
  if (lpTokenAddress) console.log(`  LPToken: ${lpTokenAddress}`);
}

main().catch(console.error);

