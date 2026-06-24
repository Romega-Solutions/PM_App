const fs = require('fs');
const path = require('path');
const file = path.resolve('src/features/matching/screens/DiscoverScreen.tsx');
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  '  const previewRotate = previewPan.x.interpolate({',
  '  const emptyPanHandlers = React.useMemo(() => ({}), []);\n\n  const previewRotate = previewPan.x.interpolate({'
);

content = content.replace(
  '  const handleKeepSwiping = useCallback(() => {',
  '  const handleShowInfo = useCallback(() => setShowInfo(true), []);\n  const handleCloseInfo = useCallback(() => setShowInfo(false), []);\n\n  const handleKeepSwiping = useCallback(() => {'
);

content = content.replace(
  'panHandlers={{}}',
  'panHandlers={emptyPanHandlers}'
);

content = content.replace(
  'panHandlers={actionPending ? {} : panResponder.panHandlers}',
  'panHandlers={actionPending ? emptyPanHandlers : panResponder.panHandlers}'
);

content = content.replace(
  'onInfo={() => setShowInfo(true)}',
  'onInfo={handleShowInfo}'
);

content = content.replace(
  'onClose={() => setShowInfo(false)}',
  'onClose={handleCloseInfo}'
);

fs.writeFileSync(file, content);
console.log('DiscoverScreen.tsx optimized successfully.');
