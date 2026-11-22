import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StatusBar,
  SafeAreaView,
  ActivityIndicator,
  Alert
} from 'react-native';
import * as Speech from 'expo-speech';

// Pointing to the shared central backend engine
const API_BASE_URL = 'http://127.0.0.1:8000/api';

export default function App() {
  const [screen, setScreen] = useState<'splash' | 'onboarding' | 'home' | 'detail'>('home');
  const [notices, setNotices] = useState<any[]>([]);
  const [selectedNotice, setSelectedNotice] = useState<any>(null);
  const [activeLocality, setActiveLocality] = useState<string>('Kukatpally');
  const [activeLanguage, setActiveLanguage] = useState<'en' | 'te' | 'hi'>('en');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  useEffect(() => {
    fetchNotices();
  }, [activeLocality]);

  const fetchNotices = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/notices?status=PUBLISHED`);
      const data = await res.json();
      setNotices(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSpeak = (text: string) => {
    if (isSpeaking) {
      Speech.stop();
      setIsSpeaking(false);
    } else {
      setIsSpeaking(true);
      Speech.speak(text, {
        language: activeLanguage === 'te' ? 'te-IN' : activeLanguage === 'hi' ? 'hi-IN' : 'en-US',
        onDone: () => setIsSpeaking(false),
        onError: () => setIsSpeaking(false),
      });
    }
  };

  // Filter notices
  const filteredNotices = notices.filter(n => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return n.title.toLowerCase().includes(q) || n.summary.toLowerCase().includes(q);
    }
    return true;
  });

  const criticalAlerts = notices.filter(n => n.urgency === 'CRITICAL');

  // Detail Screen
  if (screen === 'detail' && selectedNotice) {
    const translation = selectedNotice.translations?.[activeLanguage] || {
      title: selectedNotice.title,
      summary: selectedNotice.summary,
      action: selectedNotice.action_summary
    };

    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#0A192F" />
        
        {/* Detail Header */}
        <View style={styles.detailHeader}>
          <TouchableOpacity onPress={() => { Speech.stop(); setScreen('home'); }} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Official Public Notice</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Language Tabs */}
        <View style={styles.langBar}>
          <Text style={styles.langLabel}>Language:</Text>
          <TouchableOpacity
            onPress={() => setActiveLanguage('en')}
            style={[styles.langPill, activeLanguage === 'en' && styles.langPillActive]}
          >
            <Text style={[styles.langText, activeLanguage === 'en' && styles.langTextActive]}>English</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setActiveLanguage('te')}
            style={[styles.langPill, activeLanguage === 'te' && styles.langPillActive]}
          >
            <Text style={[styles.langText, activeLanguage === 'te' && styles.langTextActive]}>తెలుగు</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setActiveLanguage('hi')}
            style={[styles.langPill, activeLanguage === 'hi' && styles.langPillActive]}
          >
            <Text style={[styles.langText, activeLanguage === 'hi' && styles.langTextActive]}>हिन्दी</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.contentScroll} contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
          {/* Urgency Badge */}
          <View style={[styles.urgencyBadge, selectedNotice.urgency === 'CRITICAL' ? styles.badgeCritical : styles.badgeHigh]}>
            <Text style={styles.urgencyText}>{selectedNotice.urgency} PRIORITY</Text>
          </View>

          <Text style={styles.detailTitle}>{translation.title || selectedNotice.title}</Text>
          <Text style={styles.detailAuthority}>🏛️ {selectedNotice.authority}</Text>

          {/* Voice Narration Button */}
          <TouchableOpacity
            onPress={() => handleSpeak(`${translation.title}. ${translation.summary}. Required Action: ${translation.action}`)}
            style={styles.voiceButton}
          >
            <Text style={styles.voiceButtonText}>
              {isSpeaking ? '⏹️ Stop Audio Narration' : '🔊 Listen To Notice (Text-to-Speech)'}
            </Text>
          </TouchableOpacity>

          {/* Plain Summary */}
          <View style={styles.card}>
            <Text style={styles.cardHeader}>💡 SIMPLE SUMMARY FOR CITIZENS</Text>
            <Text style={styles.cardBody}>{translation.summary || selectedNotice.summary}</Text>
          </View>

          {/* Citizen Action */}
          <View style={[styles.card, { borderLeftColor: '#10B981', borderLeftWidth: 4 }]}>
            <Text style={[styles.cardHeader, { color: '#065F46' }]}>✅ WHAT YOU NEED TO DO:</Text>
            <Text style={[styles.cardBody, { fontWeight: '600', color: '#064E3B' }]}>
              {translation.action || selectedNotice.action_summary}
            </Text>
          </View>

          {/* Deadline */}
          {selectedNotice.deadline && (
            <View style={styles.deadlineBox}>
              <Text style={styles.deadlineText}>⏰ Important Deadline: {selectedNotice.deadline}</Text>
            </View>
          )}

          {/* Locations */}
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Affected Areas:</Text>
            <Text style={styles.metaValue}>{selectedNotice.locations?.join(', ') || 'All City Zones'}</Text>
          </View>

          {/* Source Link */}
          <TouchableOpacity
            onPress={() => Alert.alert('Official Source', selectedNotice.source_url || 'https://telangana.gov.in')}
            style={styles.sourceBtn}
          >
            <Text style={styles.sourceBtnText}>Verify On Official Government Portal ↗</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Home Screen
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0A192F" />

      {/* Top Mobile Bar */}
      <View style={styles.topBar}>
        <View>
          <Text style={styles.logoTitle}>🏛️ CIVIC ALERTS</Text>
          <Text style={styles.logoSub}>Telangana Smart Public Notice Platform</Text>
        </View>
        <TouchableOpacity
          onPress={() => setActiveLocality(activeLocality === 'Kukatpally' ? 'Gachibowli' : 'Kukatpally')}
          style={styles.locBadge}
        >
          <Text style={styles.locBadgeText}>📍 {activeLocality}</Text>
        </TouchableOpacity>
      </View>

      {/* Search Input */}
      <View style={styles.searchContainer}>
        <TextInput
          placeholder="Search water disruption, traffic, scholarships..."
          placeholderTextColor="#94A3B8"
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={styles.searchInput}
        />
      </View>

      <ScrollView style={styles.contentScroll} contentContainerStyle={{ paddingBottom: 30 }}>
        {/* Critical Emergency Banner */}
        {criticalAlerts.length > 0 && (
          <View style={styles.criticalBanner}>
            <Text style={styles.criticalHeader}>⚠️ EMERGENCY ALERT BROADCAST</Text>
            {criticalAlerts.map(c => (
              <TouchableOpacity
                key={c.id}
                onPress={() => { setSelectedNotice(c); setScreen('detail'); }}
                style={styles.criticalItem}
              >
                <Text style={styles.criticalTitle}>{c.title}</Text>
                <Text style={styles.criticalSummary}>{c.summary}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Locality Quick Selector */}
        <View style={styles.filterRow}>
          <Text style={styles.sectionTitle}>Announcements for Citizens</Text>
          <Text style={styles.countText}>{filteredNotices.length} notices</Text>
        </View>

        {/* Notices Cards */}
        {isLoading ? (
          <ActivityIndicator size="large" color="#1D4ED8" style={{ marginTop: 40 }} />
        ) : (
          filteredNotices.map((notice) => (
            <TouchableOpacity
              key={notice.id}
              onPress={() => { setSelectedNotice(notice); setScreen('detail'); }}
              style={styles.noticeCard}
            >
              <View style={styles.cardTop}>
                <View style={[
                  styles.pill,
                  notice.urgency === 'CRITICAL' ? styles.pillRed :
                  notice.urgency === 'HIGH' ? styles.pillOrange : styles.pillBlue
                ]}>
                  <Text style={styles.pillText}>{notice.urgency}</Text>
                </View>
                <Text style={styles.cardCategory}>{notice.category}</Text>
              </View>

              <Text style={styles.cardTitle}>{notice.title}</Text>
              <Text style={styles.cardSummary} numberOfLines={2}>{notice.summary}</Text>

              <View style={styles.actionPill}>
                <Text style={styles.actionPillText} numberOfLines={1}>
                  👉 Action: {notice.action_summary}
                </Text>
              </View>

              <View style={styles.cardFooter}>
                <Text style={styles.footerAuthority}>🏛️ {notice.authority}</Text>
                {notice.deadline && (
                  <Text style={styles.footerDeadline}>⏰ {notice.deadline}</Text>
                )}
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  topBar: {
    backgroundColor: '#0A192F',
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logoTitle: {
    color: '#38BDF8',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  logoSub: {
    color: '#94A3B8',
    fontSize: 10,
  },
  locBadge: {
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    borderColor: '#38BDF8',
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  locBadgeText: {
    color: '#38BDF8',
    fontSize: 12,
    fontWeight: '700',
  },
  searchContainer: {
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderBottomColor: '#E2E8F0',
    borderBottomWidth: 1,
  },
  searchInput: {
    backgroundColor: '#F1F5F9',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
    fontSize: 13,
    color: '#0F172A',
  },
  contentScroll: {
    flex: 1,
    padding: 12,
  },
  criticalBanner: {
    backgroundColor: '#DC2626',
    borderRadius: 12,
    padding: 14,
    marginBottom: 14,
  },
  criticalHeader: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1,
    marginBottom: 6,
  },
  criticalItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 8,
    padding: 10,
    marginTop: 4,
  },
  criticalTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  criticalSummary: {
    color: '#FEE2E2',
    fontSize: 12,
    marginTop: 2,
  },
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 8,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  countText: {
    fontSize: 12,
    color: '#64748B',
  },
  noticeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderColor: '#E2E8F0',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  pill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginRight: 8,
  },
  pillRed: { backgroundColor: '#FEE2E2' },
  pillOrange: { backgroundColor: '#FFEDD5' },
  pillBlue: { backgroundColor: '#DBEAFE' },
  pillText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#0F172A',
  },
  cardCategory: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    lineHeight: 20,
    marginBottom: 6,
  },
  cardSummary: {
    fontSize: 12,
    color: '#475569',
    lineHeight: 18,
    marginBottom: 10,
  },
  actionPill: {
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
    borderWidth: 1,
    borderRadius: 8,
    padding: 8,
    marginBottom: 8,
  },
  actionPillText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#065F46',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopColor: '#F1F5F9',
    borderTopWidth: 1,
    paddingTop: 8,
  },
  footerAuthority: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
  },
  footerDeadline: {
    fontSize: 11,
    color: '#DC2626',
    fontWeight: '700',
  },
  detailHeader: {
    backgroundColor: '#0A192F',
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  backButtonText: {
    color: '#38BDF8',
    fontSize: 14,
    fontWeight: '700',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  langBar: {
    backgroundColor: '#E2E8F0',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  langLabel: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '600',
    marginRight: 8,
  },
  langPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    marginRight: 6,
  },
  langPillActive: {
    backgroundColor: '#1D4ED8',
  },
  langText: {
    fontSize: 11,
    color: '#334155',
    fontWeight: '600',
  },
  langTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  urgencyBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  badgeCritical: { backgroundColor: '#DC2626' },
  badgeHigh: { backgroundColor: '#EA580C' },
  urgencyText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  detailTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    lineHeight: 24,
    marginBottom: 6,
  },
  detailAuthority: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '600',
    marginBottom: 14,
  },
  voiceButton: {
    backgroundColor: '#2563EB',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 14,
  },
  voiceButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    borderColor: '#E2E8F0',
    borderWidth: 1,
    marginBottom: 12,
  },
  cardHeader: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748B',
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  cardBody: {
    fontSize: 13,
    color: '#1E293B',
    lineHeight: 20,
  },
  deadlineBox: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FCA5A5',
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
  },
  deadlineText: {
    color: '#DC2626',
    fontWeight: '700',
    fontSize: 13,
  },
  metaRow: {
    marginBottom: 14,
  },
  metaLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  metaValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0F172A',
    marginTop: 2,
  },
  sourceBtn: {
    borderColor: '#CBD5E1',
    borderWidth: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  sourceBtnText: {
    color: '#1D4ED8',
    fontWeight: '700',
    fontSize: 12,
  },
});

