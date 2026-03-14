import { useEffect, useRef } from 'react'; [cite: 72]
import { OpenSheetMusicDisplay } from 'opensheetmusicdisplay'; [cite: 72]

interface Props { musicXmlUrl: string; } [cite: 72]

export default function SheetMusicDisplay({ musicXmlUrl }: Props) { [cite: 72]
  const divRef = useRef<HTMLDivElement>(null); [cite: 72]
  const osmdRef = useRef<OpenSheetMusicDisplay | null>(null); [cite: 72]

  useEffect(() => { [cite: 72]
    if (!divRef.current || !musicXmlUrl) return; [cite: 72]

    if (!osmdRef.current) { [cite: 72]
      osmdRef.current = new OpenSheetMusicDisplay(divRef.current, { [cite: 72]
        autoResize: true, [cite: 72]
        drawTitle: false, [cite: 72]
        followCursor: true, [cite: 72]
      }); [cite: 72]
    } [cite: 72]

    osmdRef.current [cite: 72]
      .load(musicXmlUrl) [cite: 72]
      .then(() => osmdRef.current?.render()); [cite: 72]
  }, [musicXmlUrl]); [cite: 72]

  return <div ref={divRef} className='w-full bg-white p-4 rounded-lg' />; [cite: 72]
} [cite: 72]