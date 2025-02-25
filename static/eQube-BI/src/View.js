import React, { useEffect, useState } from 'react';
import { view } from '@forge/bridge';

function decodeHtmlEntities(text) {
  const parser = new DOMParser();
  return parser.parseFromString(text, "text/html").body.textContent;
}

function View() {
  const [context, setContext] = useState();
  const [generatedUrl, setGeneratedUrl] = useState('');

  useEffect(() => {
    view.getContext().then((ctx) => {
      setContext(ctx);
      const rawUrl = ctx.extension.gadgetConfiguration?.generatedUrl || '';
      setGeneratedUrl(decodeHtmlEntities(rawUrl));
    });
  }, []);

  if (!context) {
    return 'Loading...';
  }

  return (
    <div>
      {generatedUrl ? (
        <iframe src={generatedUrl} width="100%" height="500px" title="Generated View" key={generatedUrl}></iframe>
      ) : (
        'No URL generated yet.'
      )}
    </div>
  );
}

export default View;
