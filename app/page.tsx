const HomePage = () => (
  <article className="prose lg:prose-xl mx-auto">
    <h1>Good for health, bad for...</h1>
    <p className="text-dn-foreground-100 italic">tl;dr: functors...</p>
    <p>
      My first computer was an IBM ThinkPad A31, running a Debian-based operating system.
      Since then, I&apos;ve been a dedicated Linux user, exploring various distributions
      like Arch, Void, openSUSE, and Fedora Linux. Among them, Arch Linux is the one
      I&apos;ve spent the most time with.
    </p>
    <p>
      In 2020, inspired by the many developers and all the cool tools build around Nix, I
      embark on daily driving NixOS. While still learning the ropes, I&apos;m eager to
      share my experiences as a web developer using open-source technologies.
    </p>
    <p>
      My journey into web development began with Angular 2, which led me to discover
      TypeScript. Previously, I had explored functional programming through my experience
      with xmonad, a Haskell-based window manager. This background helped me appreciate
      ReactJS&apos;s functional approach.
    </p>

    <h2>What I&apos;m Up To</h2>
    <ul className="list-[hiragana-iroha]">
      <li>
        <span>Learning </span>
        <a
          className="text-dn-primary-200 underline"
          href="https://effect.website/"
          target="_blank"
          rel="noopener noreferrer"
        >
          Effect-TS.
        </a>
      </li>
      <li>Reading The Logic of Scientific Discovery</li>
      <li>
        <span>Playing Type Lumina: </span>
        <a
          className="text-dn-primary-200 underline"
          href="https://meltyblood.typelumina.com/resources/img/command/meltyblood_typelumina_neco-arc_command_lists_en.pdf"
          target="_blank"
          rel="noopener noreferrer"
        >
          Neco-Arc
        </a>
        <span> and </span>
        <a
          className="text-dn-primary-200 underline"
          href="https://meltyblood.typelumina.com/resources/img/command/meltyblood_typelumina_kohaku_command_lists_en.pdf"
          target="_blank"
          rel="noopener noreferrer"
        >
          Kohaku.
        </a>
      </li>
    </ul>
  </article>
)

export default HomePage
