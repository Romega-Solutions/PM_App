// src/components/dev/TestAccountsHelper.tsx
import { User, UserCircle2 } from "lucide-react-native";
import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const ACCENT_PURPLE = "#8D69F6";
const ACCENT_PINK = "#EF3E78";
const WHITE = "#FFFFFF";
const SURFACE = "rgba(255,255,255,0.08)";

// Test accounts configuration
const TEST_ACCOUNTS = [
  {
    key: "foreigner1",
    email: "john@test.com",
    password: "test123",
    name: "John Smith",
    userType: "Foreigner",
  },
  {
    key: "foreigner2",
    email: "mike@test.com",
    password: "test123",
    name: "Michael Johnson",
    userType: "Foreigner",
  },
  {
    key: "filipina1",
    email: "maria@test.com",
    password: "test123",
    name: "Maria Santos",
    userType: "Filipina",
  },
  {
    key: "filipina2",
    email: "angel@test.com",
    password: "test123",
    name: "Angel Cruz",
    userType: "Filipina",
  },
];

interface TestAccountsHelperProps {
  onSelectAccount: (email: string, password: string) => void;
}

export default function TestAccountsHelper({
  onSelectAccount,
}: TestAccountsHelperProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!__DEV__) {
    return null; // Only show in development
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.toggleButton}
        onPress={() => setIsExpanded(!isExpanded)}
        accessible
        accessibilityRole="button"
        accessibilityLabel={
          isExpanded ? "Hide test accounts" : "Show test accounts"
        }
      >
        <UserCircle2 size={16} color={ACCENT_PURPLE} strokeWidth={2.5} />
        <Text style={styles.toggleText}>
          {isExpanded ? "Hide" : "Show"} Test Accounts
        </Text>
      </TouchableOpacity>

      {isExpanded && (
        <ScrollView
          style={styles.accountsList}
          contentContainerStyle={styles.accountsContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.headerText}>Quick Sign In (Dev Only)</Text>

          {TEST_ACCOUNTS.map((account) => (
            <TouchableOpacity
              key={account.key}
              style={styles.accountCard}
              onPress={() => onSelectAccount(account.email, account.password)}
              accessible
              accessibilityRole="button"
              accessibilityLabel={`Sign in as ${account.name}`}
            >
              <View style={styles.accountIcon}>
                <User size={18} color={ACCENT_PINK} strokeWidth={2.5} />
              </View>
              <View style={styles.accountInfo}>
                <Text style={styles.accountName}>{account.name}</Text>
                <Text style={styles.accountType}>{account.userType}</Text>
                <Text style={styles.accountEmail}>{account.email}</Text>
              </View>
            </TouchableOpacity>
          ))}

          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
              💡 All test accounts use password:{" "}
              <Text style={styles.infoTextBold}>test123</Text>
            </Text>
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
    marginBottom: 8,
  },
  toggleButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: SURFACE,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(141, 105, 246, 0.3)",
  },
  toggleText: {
    fontSize: 13,
    color: ACCENT_PURPLE,
    fontWeight: "600",
  },
  accountsList: {
    marginTop: 12,
    maxHeight: 400,
  },
  accountsContent: {
    gap: 10,
    paddingBottom: 8,
  },
  headerText: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.6)",
    textAlign: "center",
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  accountCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: SURFACE,
    borderRadius: 14,
    padding: 14,
    gap: 12,
    borderWidth: 1,
    borderColor: "rgba(141, 105, 246, 0.25)",
  },
  accountIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(239, 62, 120, 0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  accountInfo: {
    flex: 1,
    gap: 2,
  },
  accountName: {
    fontSize: 15,
    color: WHITE,
    fontWeight: "700",
  },
  accountType: {
    fontSize: 12,
    color: ACCENT_PURPLE,
    fontWeight: "600",
  },
  accountEmail: {
    fontSize: 11,
    color: "rgba(255, 255, 255, 0.6)",
  },
  infoBox: {
    backgroundColor: "rgba(141, 105, 246, 0.1)",
    borderRadius: 12,
    padding: 12,
    marginTop: 4,
    borderWidth: 1,
    borderColor: "rgba(141, 105, 246, 0.2)",
  },
  infoText: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.7)",
    textAlign: "center",
    lineHeight: 18,
  },
  infoTextBold: {
    fontWeight: "700",
    color: ACCENT_PURPLE,
  },
});
