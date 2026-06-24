const fs = require('fs');
const path = require('path');

const filePath = path.join(process.cwd(), 'src/features/messaging/screens/ChatScreen.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Update handleSend
const handleSendTarget = `  const handleSend = useCallback(async () => {
    if (inputText.trim().length === 0) return;

    const messageText = inputText.trim();
    setSendError(null);
    setInputText("");`;

const handleSendReplacement = `  const handleSend = useCallback(async () => {
    if (inputText.trim().length === 0) return;

    let messageText = inputText.trim();
    if (replyingTo) {
      const replyPrefix = replyingTo.type === 'image' ? 'Photo message' : replyingTo.text;
      const snippet = replyPrefix.length > 30 ? replyPrefix.substring(0, 30) + '...' : replyPrefix;
      messageText = \`> Replying to: "\${snippet}"\\n\\n\${messageText}\`;
    }

    setSendError(null);
    setInputText("");
    setReplyingTo(null);`;

content = content.replace(handleSendTarget, handleSendReplacement);

// 2. Render reply preview
const inputTarget = `          <View style={styles.inputRow}>
            {/* Media Button */}`;

const inputReplacement = `          {replyingTo && (
            <View style={styles.replyPreviewContainer}>
              <View style={styles.replyPreviewBorder} />
              <View style={styles.replyPreviewContent}>
                <Text style={styles.replyPreviewName}>
                  Replying to {replyingTo.sender_id === currentUserId ? 'yourself' : userName}
                </Text>
                <Text style={styles.replyPreviewText} numberOfLines={1}>
                  {replyingTo.type === 'image' ? 'Photo message' : replyingTo.text}
                </Text>
              </View>
              <TouchableOpacity 
                style={styles.replyPreviewClose}
                onPress={() => setReplyingTo(null)}
              >
                <X size={18} color={TEXT_SECONDARY} />
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.inputRow}>
            {/* Media Button */}`;

content = content.replace(inputTarget, inputReplacement);

// 3. Inject styles
const styleTarget = `  // Messages
  messagesContainer: {`;

const styleReplacement = `  replyPreviewContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
  },
  replyPreviewBorder: {
    width: 3,
    height: '100%',
    backgroundColor: ACCENT_PURPLE,
    borderRadius: 2,
    marginRight: 12,
  },
  replyPreviewContent: {
    flex: 1,
  },
  replyPreviewName: {
    fontSize: 12,
    fontFamily: 'DMSans-Bold',
    color: ACCENT_PURPLE,
    marginBottom: 2,
  },
  replyPreviewText: {
    fontSize: 13,
    fontFamily: 'DMSans-Regular',
    color: TEXT_SECONDARY,
  },
  replyPreviewClose: {
    padding: 8,
  },
  // Messages
  messagesContainer: {`;

content = content.replace(styleTarget, styleReplacement);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully updated ChatScreen.tsx');
