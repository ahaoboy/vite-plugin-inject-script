import fs from 'fs';
import { resolve } from 'path';
import type { ResolvedConfig } from 'vite';
let viteConfig: ResolvedConfig;
const includeRegexp: RegExp = new RegExp(/\.(css|js)$/i);
const excludeRegexp: RegExp = new RegExp(/vendor/);
/**
 * 给index.js注入script脚本
 * @param {string} script - 需要执行的脚本字符串
 */
const banner = (script: string): any => {
  return {
    name: 'vite-plugin-inject-script',
    configResolved(resolvedConfig: ResolvedConfig) {
      viteConfig = resolvedConfig;
    },
    //@ts-ignore
    async writeBundle(options: any, bundle: any) {
      for (const file of Object.entries(bundle)) {
        // 获取文件路径
        const root: string = viteConfig.root;
        const outDir: string = viteConfig.build.outDir || 'dist';
        const fileName: string = file[0];
        const filePath: string = resolve(root, outDir, fileName);
        if (!(fileName.includes('assets/index') && fileName.endsWith('js'))) {
          continue;
        }
        // 只处理匹配到的文件
        if (includeRegexp.test(fileName) && !excludeRegexp.test(fileName)) {
          try {
            // 读取文件内容
            let data: string = fs.readFileSync(filePath, {
              encoding: 'utf8',
            });
            // 否则添加注释符
            data = `${script};\n${data}`;
            fs.writeFileSync(filePath, data);
          } catch (e) {
            throw e;
          }
        }
      }
    },
  };
};

export default banner;
