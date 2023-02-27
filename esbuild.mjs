import * as esbuild from 'esbuild'
import manifestPlugin from 'esbuild-plugin-assets-manifest'

const [client, server] = await Promise.all([
    esbuild.context({
        entryPoints: { main: './src/client/main.tsx' },
        bundle: true,
        platform: 'browser',
        splitting: true,
        outdir: './dist/client',
        tsconfig: './tsconfig.json',
        publicPath: '/assets',
        assetNames: 'assets/[name]-[hash].dev',
        chunkNames: '[name]-[hash].dev',
        entryNames: '[name].dev',
        format: 'esm',
        plugins: [manifestPlugin({ filename: 'manifest.json' })],
    }),
    esbuild.context({
        entryPoints: { server: './src/server/server.tsx' },
        bundle: true,
        platform: 'node',
        packages: 'external',
        target: 'node18',
        outdir: './dist/server',
        tsconfig: './tsconfig.json',
    }),
]).catch(() => process.exit(1))

await Promise.all([client.rebuild(), server.rebuild()]).catch(() => process.exit(1))

await Promise.all([client.dispose(), server.dispose()]).catch(() => process.exit(1))
