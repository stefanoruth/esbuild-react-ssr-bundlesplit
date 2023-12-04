import * as esbuild from 'esbuild'
import cssPlugin from 'esbuild-style-plugin'
import tailwindcss from 'tailwindcss'
import autoprefixer from 'autoprefixer'
import manifestPlugin from 'esbuild-plugin-assets-manifest'
import start from '@es-exec/esbuild-plugin-start'
import fs from 'fs/promises'
import path from 'path'

const watch = process.env.WATCH === 'true' || process.argv.includes('--watch') || false
const production = process.env.NODE_ENV === 'production' || process.argv.includes('--prod') || false
const analyze = process.env.ANALYZE === 'true' || process.argv.includes('--analyze') || false

const base = {
    tsconfig: './tsconfig.json',
    bundle: true,
    sourcemap: 'external',
    publicPath: '/assets',
    alias: {
        $: './src',
    },
    loader: {
        '.jpeg': 'file',
    },
    assetNames: 'files/[name].[hash]',
    chunkNames: 'chunks/[name].[hash]',
}

const [client, server] = await Promise.all([
    esbuild.context({
        ...base,
        entryPoints: { main: './src/client/main.tsx' },
        platform: 'browser',
        splitting: true,
        metafile: true,
        outdir: './dist/client',
        entryNames: '[name].[hash]',
        format: 'esm',
        minify: production,
        plugins: [
            cssPlugin({
                extract: true,
                postcss: {
                    plugins: [tailwindcss(), autoprefixer()],
                },
            }),
            manifestPlugin({
                filename: 'manifest.json',
            }),
        ],
    }),
    esbuild.context({
        ...base,
        entryPoints: ['./src/server/server.tsx'],
        platform: 'node',
        packages: 'external',
        target: 'node20',
        outdir: './dist/server',
        plugins: [
            cssPlugin({
                extract: false,
                postcss: {
                    plugins: [tailwindcss(), autoprefixer()],
                },
            }),
            watch &&
                start({
                    script: 'node -r dotenv/config -r source-map-support/register dist/server/server.js',
                }),
        ].filter(Boolean),
    }),
]).catch(() => process.exit(1))

const [clientBuild] = await Promise.all([client.rebuild(), server.rebuild()]).catch(() => process.exit(1))

if (analyze) {
    await fs.writeFile(path.resolve('./dist/metafile.json'), JSON.stringify(clientBuild.metafile))
}

if (watch) {
    await Promise.all([client.watch(), server.watch()])
} else {
    await Promise.all([client.dispose(), server.dispose()])
}
