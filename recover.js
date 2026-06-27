const fs = require('fs');
const readline = require('readline');

async function recover() {
  const logPath = 'C:\\Users\\Administrator\\.gemini\\antigravity-ide\\brain\\ccfd589d-b2de-46e6-9997-4f3467b813b9\\.system_generated\\logs\\transcript.jsonl';
  const fileStream = fs.createReadStream(logPath);
  const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

  let homeJsxContent = '';

  for await (const line of rl) {
    try {
      const entry = JSON.parse(line);
      if (entry.tool_calls) {
        for (const call of entry.tool_calls) {
          const args = call.args;
          if (args && args.TargetFile && args.TargetFile.includes('Home.jsx')) {
            if (call.name === 'write_to_file') {
              homeJsxContent = args.CodeContent;
            } else if (call.name === 'replace_file_content') {
               // naive string replace based on target/replacement
               if (homeJsxContent.includes(args.TargetContent)) {
                 homeJsxContent = homeJsxContent.replace(args.TargetContent, args.ReplacementContent);
               }
            } else if (call.name === 'multi_replace_file_content') {
               if (args.ReplacementChunks) {
                 for (const chunk of args.ReplacementChunks) {
                   if (homeJsxContent.includes(chunk.TargetContent)) {
                     homeJsxContent = homeJsxContent.replace(chunk.TargetContent, chunk.ReplacementContent);
                   }
                 }
               }
            }
          }
        }
      }
    } catch (e) {}
  }

  fs.writeFileSync('C:\\Users\\Administrator\\Documents\\MyProject\\Peminjaman Mahasiswa\\frontend\\src\\pages\\Home_recovered.jsx', homeJsxContent || '');
  console.log('Recovery complete!');
}

recover();
