/**
 * 大屏缩放计算函数
 * @param {number} baseWidth 基础宽度 (默认1920)
 * @param {number} baseHeight 基础高度 (默认1080)
 * @param {number} minScale 最小缩放比例 (默认0.5)
 * @param {number} maxScale 最大缩放比例 (默认2)
 * @returns {Object} 缩放信息
 */
export function calculateScreenScale(baseWidth = 1920, baseHeight = 1080, minScale = 0.5, maxScale = 2) {
  const currentWidth = window.innerWidth;
  const currentHeight = window.innerHeight;
  
  // 计算缩放比例
  const scaleX = currentWidth / baseWidth;
  const scaleY = currentHeight / baseHeight;
  
  // 使用较小的缩放比例，保持宽高比
  let scale = Math.min(scaleX, scaleY);
  
  // 限制缩放范围
  scale = Math.max(minScale, Math.min(maxScale, scale));
  
  return {
    scale,
    baseWidth,
    baseHeight,
    currentWidth,
    currentHeight,
    scaledWidth: baseWidth * scale,
    scaledHeight: baseHeight * scale
  };
}

/**
 * 应用缩放样式
 * @param {HTMLElement} element 要缩放的元素
 * @param {number} scale 缩放比例
 */
export function applyScale(element, scale) {
  element.style.transform = `scale(${scale})`;
  element.style.transformOrigin = 'center center';
  element.style.width = '1920px';
  element.style.height = '1080px';
} 