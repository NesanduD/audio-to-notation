import { useEffect, useRef } from 'react';
import { OpenSheetMusicDisplay } from 'opensheetmusicdisplay';

interface Props { musicXmlUrl: string; }

export default function SheetMusicDisplay({ musicXmlUrl }: Props) {
  const divRef = useRef<HTMLDivElement>(null);
  const osmdRef = useRef<OpenSheetMusicDisplay | null>(null);

  useEffect(() => {
    if (!divRef.current || !musicXmlUrl) return;

    if (!osmdRef.current) {
      osmdRef.current = new OpenSheetMusicDisplay(divRef.current, {
        autoResize: true,
        drawTitle: false,
        followCursor: true,
      });
    }

    osmdRef.current
      .load(musicXmlUrl)
      .then(() => osmdRef.current?.render());
  }, [musicXmlUrl]);

  return <div ref={divRef} className='w-full bg-white p-4 rounded-lg' />;
}