# Snapidy

Alternative web client for [Snapcast](https://github.com/badaix/snapcast).

## Why Snapidy?

There's already a great web client for Snapcast named [Snapweb](https://github.com/badaix/snapweb) that's bundled with Snapcast.
The problem with Snapweb is it presents all clients separately, which is annoying if you have multiple clients running on a single host.
The key difference is that Snapidy presents a single volume+mute control for each host.

## Usage

Download the latest archive from the releases page. This contains all assets already built and ready for use.

Once you've extracted the archive, you'll need to manually create the `config.json` file.

## Development

1. Copy `config.example.json` to `config.json` and set the `wsUrl` parameter to the `jsonrpc` URL for your Snapcast instance
2. Run `make` (requires [TypeScript](https://www.typescriptlang.org/)) to prepare all assets in a single directory
3. Run `make serve` to run a temporary webserver, and open the URL in your browser

## Acknowledgements

This repository uses some assets from Snapweb. Some of the code was also directly copy+pasted or inspired by code in Snapweb.

This repository bundles a copy of Vue 3 and Vuex 4 for ease of development. This code is covered under the MIT license, not the GPL3 license.
