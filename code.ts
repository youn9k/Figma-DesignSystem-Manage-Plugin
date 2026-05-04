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

async function getColorVariables() {
  const variables = await figma.variables.getLocalVariablesAsync('COLOR');

  return variables.map(variable => {
    const themeIdMap: Record<string, string> = {};
    themeIdMap['Value'] = Object.keys(variable.valuesByMode)[0];

    const defaultColor = variable.valuesByMode[themeIdMap['Value']];
    return {
      name: variable.name,
      hex: toHex(defaultColor as RGB),
    };
  });
}

async function getFontStyles() {
  const styles = await figma.getLocalTextStylesAsync();
  return styles.map(style => ({
    name: style.name,
    fontFamily: style.fontName.family,
    fontStyle: style.fontName.style,
    fontSize: style.fontSize,
    lineHeight:
      typeof style.lineHeight === 'number'
      ? style.lineHeight
      : style.lineHeight.unit === 'PIXELS'
        ? style.lineHeight.value
        : undefined, // FIXME: "130%" 이렇게 와서 여기로 빠지는듯
    letterSpacing:
      typeof style.letterSpacing === 'number' 
      ? style.letterSpacing 
      : style.letterSpacing.value,
  }));
}

figma.ui.onmessage = async (msg) => {
  if (msg.type === 'deployColor') {
    const colors = await getColorVariables();
    const payload = JSON.stringify({ colors });
    console.log(payload);
    
    // await fetch('https://nklcb.xyz/api/post-color', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: payload
    // });
    figma.notify('✅ 색상 정보가 전송되었습니다!');
  } 
  else if (msg.type === 'deployFont') {
    const fonts = await getFontStyles();
    const payload = JSON.stringify({ fonts });
    console.log(payload);
    
    // await fetch('https://nklcb.xyz/api/post-font', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: payload
    // });
    figma.notify('✅ 폰트 정보가 전송되었습니다!');
  } 
  else if (msg.type === 'previewColor') {
    const colors = await getColorVariables();
    const json = JSON.stringify({ colors }, null, 2);
    figma.ui.postMessage({ type: 'previewColorData', data: json });
  } 
  else if (msg.type === 'previewFont') {
    const font = await getFontStyles();
    const json = JSON.stringify({ font }, null, 2);
    figma.ui.postMessage({ type: 'previewFontData', data: json });
  } 
  else if (msg.type === 'resize') {
    figma.ui.resize(350, msg.height);
  }
};

figma.showUI(__html__, { width: 350, height: 500 });