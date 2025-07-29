function toHex(color: RGB) {
  const r = Math.round(color.r * 255);
  const g = Math.round(color.g * 255);
  const b = Math.round(color.b * 255);
  return (
    '#' +
    r.toString(16).padStart(2, '0') +
    g.toString(16).padStart(2, '0') +
    b.toString(16).padStart(2, '0')
  );
}

async function getColorStyles() {
  const styles = await figma.getLocalPaintStylesAsync();
  const colors = [];

  for (const style of styles) {
    const paints = style.paints;

    // 색상 정의(paints)가 1개만 존재하고,
    // 타입이 "SOLID"인 경우에만 유효한 색상으로 판단해 처리합니다.
    if (paints.length !== 1 || paints[0].type !== 'SOLID') continue;

    colors.push({
      name: style.name, // Figma에서 지정한 스타일 이름 ("Primary/500" 등)
      hex: toHex(paints[0].color)
    });
  }

  return colors;
}

figma.ui.onmessage = async (msg) => {
  if (msg.type === 'deploy') {
    const colors = await getColorStyles();
    const payload = JSON.stringify([{ colors }]);
    console.log(payload);
    
    await fetch('https://nklcb.xyz/api/post-color', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: payload
    });
    figma.notify('✅ 색상 정보가 전송되었습니다!');
  } 
  else if (msg.type === 'preview') {
    const colors = await getColorStyles();
    const json = JSON.stringify(colors, null, 2);
    figma.ui.postMessage({ type: 'previewData', data: json });
  } 
  else if (msg.type === 'resize') {
    figma.ui.resize(300, msg.height);
  }
};

figma.showUI(__html__, { width: 300, height: 200 });