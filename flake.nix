{
  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixpkgs-unstable";
  };

  outputs =
    { self, nixpkgs }:
    let
      inherit (nixpkgs.lib) genAttrs;
      systems = [
        "x86_64-linux"
        "x86_64-darwin"
        "aarch64-linux"
        "aarch64-darwin"
      ];
      eachSystem = f: genAttrs systems (s: f { pkgs = nixpkgs.legacyPackages.${s}; });
    in
    {
      devShells = eachSystem (
        { pkgs }:
        {
          default = pkgs.mkShell {
            nativeBuildInputs = with pkgs; [
              (bun.overrideAttrs (oldAttrs: {
                # Fix Sharp installation: depends on libstdc++.so.6
                buildInputs = (oldAttrs.buildInputs or [ ]) ++ [ stdenv.cc.cc ];
                postFixup =
                  (oldAttrs.postFixup or "")
                  + ''
                    export LD_LIBRARY_PATH="${stdenv.cc.cc.lib}/lib:$LD_LIBRARY_PATH"
                  '';
              }))
              biome
            ];
            env = with pkgs; {
              BIOME_BINARY = "${biome}/bin/biome";
              LD_LIBRARY_PATH = "${stdenv.cc.cc.lib}/lib:$LD_LIBRARY_PATH";
            };
          };

        }
      );
      formatter = eachSystem ({ pkgs }: pkgs.nixfmt-rfc-style);
    };
}
