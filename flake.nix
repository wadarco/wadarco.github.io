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
          nativeBuildInputs = with pkgs; [
            bun
            biome
          ];
          env = with pkgs; {
            BIOME_BINARY = "${biome}/bin/biome";
            # Fix Sharp installation: depends on libstdc++.so.6
            LD_LIBRARY_PATH = "${stdenv.cc.cc.lib}/lib:$LD_LIBRARY_PATH";
          };
        };

      });
      formatter = eachSystem (pkgs: pkgs.nixfmt-rfc-style);
    };
}
