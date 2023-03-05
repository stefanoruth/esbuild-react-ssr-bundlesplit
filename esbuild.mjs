import * as esbuild from 'esbuild'
import manifestPlugin from 'esbuild-plugin-assets-manifest'
import cssModulesPlugin from 'esbuild-css-modules-plugin'
import fs from 'fs/promises'
import path from 'path'

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
        plugins: [
            cssModulesPlugin({ v2: true, inject: false }),
            // manifestPlugin({
            //     filename: 'manifest2.json',
            // }),
            {
                name: 'manifest',
                setup(build) {
                    build.initialOptions.metafile = true

                    build.onEnd(result => {
                        // console.dir(result.metafile.outputs, { depth: null })

                        const files = Object.entries(result.metafile.outputs).reduce((obj, [key, config]) => {
                            if (!config.entryPoint) {
                                return obj
                            }

                            obj[config.entryPoint] = {
                                js: key.replace('dist/client', '/assets'),
                                css: config.cssBundle?.replace('dist/client', '/assets'),
                            }

                            return obj
                        }, {})

                        // console.log({ files })

                        return fs.writeFile(
                            path.resolve(path.join(build.initialOptions.outdir, 'manifest.json')),
                            JSON.stringify(files, null, 2)
                        )
                    })
                },
            },
        ],
    }),
    esbuild.context({
        entryPoints: { server: './src/server/server.tsx' },
        bundle: true,
        platform: 'node',
        packages: 'external',
        target: 'node18',
        outdir: './dist/server',
        tsconfig: './tsconfig.json',
        plugins: [cssModulesPlugin({ v2: true, inject: false })],
    }),
]).catch(() => process.exit(1))

const [clientResult] = await Promise.all([client.rebuild(), server.rebuild()]).catch(() => process.exit(1))

// console.log(clientResult.metafile)

await Promise.all([client.dispose(), server.dispose()]).catch(() => process.exit(1))
