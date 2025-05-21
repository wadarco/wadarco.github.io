const SVGIcon = ({
  src,
  alt,
  ...props
}: React.HTMLAttributes<HTMLImageElement> & { src: string; alt: string }) => (
  <img
    {...props}
    src={src}
    alt={alt}
    loading="eager"
    decoding="sync"
    height={15}
    width={15}
    draggable={false}
  />
)

export default ({ language }: { language: string }) => (
  <figure className="pointer-events-none inline-flex select-none items-center">
    <span className="inline-block dark:hidden">
      <SVGIcon src={`/icons/${language}.svg`} alt={language} />
    </span>
    <span className="hidden dark:inline-block">
      <SVGIcon src={`/icons/${language}_dark.svg`} alt={language} />
    </span>
  </figure>
)
