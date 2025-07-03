{
  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixpkgs-unstable";
  };

  outputs =
    { self, nixpkgs }:
    let
      inherit (nixpkgs.lib) genAttrs systems;
      eachSystem = f: genAttrs systems.flakeExposed (system: f nixpkgs.legacyPackages.${system});
    in
    {
      devShells = eachSystem (pkgs: {
        default = pkgs.mkShell {
          buildInputs = [ pkgs.bun ];

          env = with pkgs; rec {
            NIX_LD_LIBRARY_PATH = lib.makeLibraryPath [ stdenv.cc.cc ];
            NIX_LD = lib.fileContents "${stdenv.cc}/nix-support/dynamic-linker";
            LD_LIBRARY_PATH = NIX_LD_LIBRARY_PATH;
          };
        };
      });
      formatter = eachSystem (pkgs: pkgs.nixfmt-rfc-style);
    };
}
