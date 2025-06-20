import type { AnchorHTMLAttributes } from 'react'

const HomePage = () => (
  <article className="prose md:prose-lg mx-auto">
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
        <Link href="https://effect.website/">Effect-TS.</Link>
      </li>
      <li>Reading 20th Century Boys</li>
      <li>
        <span>Playing Type Lumina: </span>
        <Link href="https://meltyblood.typelumina.com/resources/img/command/meltyblood_typelumina_neco-arc_command_lists_en.pdf">
          Neco-Arc
        </Link>
        <span> and </span>
        <Link href="https://meltyblood.typelumina.com/resources/img/command/meltyblood_typelumina_kohaku_command_lists_en.pdf">
          Kohaku.
        </Link>
      </li>
    </ul>
  </article>
)

const Link: React.FC<AnchorHTMLAttributes<HTMLAnchorElement>> = ({
  className,
  ...props
}) => {
  return (
    <a
      className={`text-dn-primary-200 no-underline decoration-2 underline-offset-2 hover:underline ${className}`}
      target="_blank"
      rel="noopener noreferrer"
      {...props}
    />
  )
}

export default HomePage
