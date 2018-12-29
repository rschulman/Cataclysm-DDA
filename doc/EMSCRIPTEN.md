# This repository contains bare bones support for compiling CDDA to WebAssembly using `emscripten`.

## The following instructions are what I (`rschulman`) have used to make it compile, though not run.
* Follow [the instructions](http://kripken.github.io/emscripten-site/docs/getting_started/downloads.html) to install and configure emscripten.
* Compile the source files into one binary file using: 
```
emmake make -j4 EMSCRIPTEN=1 TILES=1 BACKTRACE=0 VERBOSE=1 RUNTESTS=0 PREFIX=/data
```
* `mv cataclysm-tiles cataclysm-tiles.o` because `emcc` expects a `.o` suffix when in linking mode, and I haven't fixed the `Makefile` yet.
* To compile the linked file into WebAssembly, along with the Javascript and HTML to load it:
```
emcc -j4 -g4 -s USE_SDL_IMAGE=2 -s USE_SDL_TTF=2 -s USE_SDL=2 -s DEMANGLE_SUPPORT=1 -s DISABLE_EXCEPTION_CATCHING=2 -s ALLOW_MEMORY_GROWTH=1 cataclysm-tiles.o -o cataclysm.html --preload-file data@/data/share/cataclysm-dda --preload-file gfx@/data/share/cataclysm-dda/gfx --pre-js em_prejs.js
```
* Notes on this invocation:
    1. -g4 tells Emscripten to use full debugging, including source maps for all C/C++ files
    2. USE_SDL* tells Emscripten to use its own SDL-> Web library.
    3. DEMANGLE_SUPPORT and DISABLE_EXCEPTION_CATCHING are both useful for debugging purposes.
    4. ALLOW_MEMORY_GROWTH gives us the ability to download the entire 93MB data file into browser memory at once.
        * Note that this is probably not the most efficient way to do it, but it is the easiest right now.
    5. --preload-file tells Emscripten to take the specified directories and load them at the directories after the `@` within the virtual file system.
    6. --pre-js references Javascript for the runtime to load before execution of the primary WebAssembly function. We use it here to create and preload a directory in the virtual filesystem sourced from the browser's IndexedDB, to provide permanent storage for save games and worlds.

## Current status
* 2018-12-28
    * `rschulman` has rewritten parts of `main.cpp`, `sdltiles.cpp`, and `main_menu.cpp`, partly to allow loading of preliminary assests, but mainly to address the issue that browsers don't like `while( true )` loops, since [there's only one main loop](https://kripken.github.io/emscripten-site/docs/porting/emscripten-runtime-environment.html#browser-main-loop) and if you don't return from it prompty, the browser will decide your page is dead.
    * The solution to this is to refactor CDDA's various main loops to all extend from one over-arching loop that is called repeatedly by the browser. This looks like it will be a lot of work. The beginnings of the work have happened in `main.cpp` and `main_menu.cpp`. 