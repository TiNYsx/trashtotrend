'use client'

import * as React from 'react'
import Image from 'next/image'
import useEmblaCarousel from 'embla-carousel-react'
import Autoplay from 'embla-carousel-autoplay'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

const photobookImages = [
  { src: '/images/photobook/1st.jpg', alt: 'Photobook Page 1', span: 'single' },
  { src: '/images/photobook/2nd.png', alt: 'Photobook Page 2', span: 'double' },
  { src: '/images/photobook/3rd.jpg', alt: 'Photobook Page 3', span: 'single' },
  { src: '/images/photobook/4 th.png', alt: 'Photobook Page 4', span: 'double' },
  { src: '/images/photobook/5th.jpg', alt: 'Photobook Page 5', span: 'double' },
  { src: '/images/photobook/6 th.jpg', alt: 'Photobook Page 6', span: 'double' },
  { src: '/images/photobook/7 th.png', alt: 'Photobook Page 7', span: 'double' },
  { src: '/images/photobook/8 th.jpg', alt: 'Photobook Page 8', span: 'double' },
  { src: '/images/photobook/kj.png', alt: 'Photobook Cover', span: 'double' },
]

export default function PhotobookCarousel() {
  const [api, setApi] = React.useState<any>(null)
  const [current, setCurrent] = React.useState(0)
  const [count, setCount] = React.useState(0)
  const [isHovered, setIsHovered] = React.useState(false)

  const plugin = React.useRef(
    Autoplay({
      delay: 4000,
      stopOnInteraction: false,
      stopOnMouseEnter: true,
    })
  )

  const [emblaRef] = useEmblaCarousel(
    {
      align: 'center',
      loop: true,
      skipSnaps: false,
    },
    [plugin.current]
  )

  React.useEffect(() => {
    if (!api) return

    setCount(api.scrollSnapList().length)
    setCurrent(api.selectedScrollSnap())

    api.on('select', () => {
      setCurrent(api.selectedScrollSnap())
    })
  }, [api])

  const scrollPrev = React.useCallback(() => {
    api?.scrollPrev()
  }, [api])

  const scrollNext = React.useCallback(() => {
    api?.scrollNext()
  }, [api])

  const scrollTo = React.useCallback(
    (index: number) => {
      api?.scrollTo(index)
    },
    [api]
  )

  return (
    <div className="w-full">
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold text-foreground mb-2">
          From Trash to Trend
        </h2>
        <p className="text-muted-foreground">
          Browse our photobook collection
        </p>
      </div>

      <div
        className="relative group"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div ref={emblaRef} className="overflow-hidden rounded-2xl">
          <div className="flex">
            {photobookImages.map((image, index) => (
              <div
                key={index}
                className={cn(
                  'flex-shrink-0 flex-grow-0 pl-4 first:pl-0',
                  image.span === 'single'
                    ? 'basis-[85%] sm:basis-[60%] md:basis-[45%]'
                    : 'basis-[95%] sm:basis-[80%] md:basis-[70%]'
                )}
              >
                <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-muted/50">
                  <Image
                    src={image.src}
                    alt={image.alt}
                    fill
                    className="object-contain transition-transform duration-700"
                    sizes="(max-width: 640px) 95vw, (max-width: 768px) 80vw, 70vw"
                    priority={index < 3}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Navigation Arrows */}
        <Button
          variant="outline"
          size="icon"
          className={cn(
            'absolute left-2 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-background/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-lg',
            'hover:bg-background hover:scale-105'
          )}
          onClick={scrollPrev}
        >
          <ArrowLeft className="h-5 w-5" />
          <span className="sr-only">Previous slide</span>
        </Button>

        <Button
          variant="outline"
          size="icon"
          className={cn(
            'absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-background/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-lg',
            'hover:bg-background hover:scale-105'
          )}
          onClick={scrollNext}
        >
          <ArrowRight className="h-5 w-5" />
          <span className="sr-only">Next slide</span>
        </Button>
      </div>

      {/* Page Counter */}
      <div className="mt-6 flex items-center justify-center gap-4">
        <span className="text-sm font-medium text-muted-foreground tabular-nums">
          {current + 1} / {count || photobookImages.length}
        </span>
      </div>

      {/* Dot Indicators */}
      <div className="mt-3 flex justify-center gap-2">
        {Array.from({ length: count || photobookImages.length }).map((_, index) => (
          <button
            key={index}
            onClick={() => scrollTo(index)}
            className={cn(
              'h-2 rounded-full transition-all duration-300',
              current === index
                ? 'w-6 bg-primary'
                : 'w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50'
            )}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  )
}
