import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Modal,
  ScrollView,
  ActivityIndicator,
  Alert
} from 'react-native';
import { sessionDebugger } from '../../utils/sessionDebugger';
import { supabase, authEvents } from '../../core/services/supabaseClient';
import { Ionicons } from '@expo/vector-icons';

// Define props for the component
interface SessionDebugButtonProps {
  showAdvanced?: boolean;
  onReset?: () => void;
  floatingPosition?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
}

/**
 * An enhanced component that provides diagnostic tools and options to fix authentication issues
 */
export const SessionDebugButton: React.FC<SessionDebugButtonProps> = ({ 
  showAdvanced = false,
  onReset,
  floatingPosition = 'bottom-right'
}) => {
  // State
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [actionResult, setActionResult] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'diagnosis' | 'repair' | 'advanced'>('diagnosis');
  
  // Effect to listen for auth events
  useEffect(() => {
    const authResetListener = authEvents.on('authReset', () => {
      // If modal is open, refresh the debug info
      if (isModalVisible) {
        collectDebugInfo();
      }
    });
    
    const authStateListener = authEvents.on('authStateChange', () => {
      // If modal is open, refresh the debug info
      if (isModalVisible) {
        collectDebugInfo();
      }
    });
    
    return () => {
      authResetListener();
      authStateListener();
    };
  }, [isModalVisible]);
  
  // Handle debug button press
  const handleDebugPress = async () => {
    setIsModalVisible(true);
    await collectDebugInfo();
  };
  
  // Collect debug information
  const collectDebugInfo = async () => {
    setIsLoading(true);
    try {
      const info = await sessionDebugger.collectDebugInfo();
      setDebugInfo(info);
    } catch (error) {
      console.error('Error collecting debug info:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle fix session button press
  const handleFixSession = async () => {
    setIsLoading(true);
    setActionResult(null);
    try {
      const result = await sessionDebugger.fixSessionIssues();
      setActionResult({
        type: 'fix',
        success: result.success,
        message: result.success 
          ? 'Session fixed successfully!' 
          : `Fix failed: ${result.error || 'Unknown error'}`,
        details: result.actions
      });
      // Refresh debug info
      await collectDebugInfo();
    } catch (error: any) {
      setActionResult({
        type: 'fix',
        success: false,
        message: `Unexpected error: ${error?.message || error}`,
        details: []
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle recover broken session button press
  const handleRecoverSession = async () => {
    setIsLoading(true);
    setActionResult(null);
    try {
      const result = await sessionDebugger.recoverBrokenSession();
      setActionResult({
        type: 'recover',
        success: result.success,
        message: result.success 
          ? 'Session recovered successfully!' 
          : `Recovery attempt: ${result.message}`,
        details: [result.message]
      });
      // Refresh debug info
      await collectDebugInfo();
    } catch (error: any) {
      setActionResult({
        type: 'recover',
        success: false,
        message: `Unexpected error: ${error?.message || error}`,
        details: []
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle reset button press
  const handleResetSession = async () => {
    // Confirm action with user
    Alert.alert(
      "Reset Session",
      "This will sign you out and clear all session data. Continue?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Reset",
          style: "destructive",
          onPress: async () => {
            setIsLoading(true);
            setActionResult(null);
            try {
              await sessionDebugger.clearSessionStorage();
              setActionResult({
                type: 'reset',
                success: true,
                message: 'Session storage cleared successfully!',
                details: ['Signed out', 'Cleared session storage']
              });
              // Refresh debug info
              await collectDebugInfo();
              // Call onReset callback if provided
              if (onReset) {
                onReset();
              }
            } catch (error: any) {
              setActionResult({
                type: 'reset',
                success: false,
                message: `Reset failed: ${error?.message || error}`,
                details: []
              });
            } finally {
              setIsLoading(false);
            }
          }
        }
      ]
    );
  };
  
  // Handle complete reset (data + auth)
  const handleFullReset = async () => {
    // Confirm action with user
    Alert.alert(
      "Reset Application",
      "This will sign you out, clear ALL session data, and reset app preferences. Continue?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Full Reset",
          style: "destructive",
          onPress: async () => {
            setIsLoading(true);
            setActionResult(null);
            try {
              await sessionDebugger.resetApplication();
              setActionResult({
                type: 'full-reset',
                success: true,
                message: 'Application completely reset!',
                details: ['Signed out', 'Cleared session storage', 'Reset app data']
              });
              // Refresh debug info
              await collectDebugInfo();
              // Call onReset callback if provided
              if (onReset) {
                onReset();
              }
            } catch (error: any) {
              setActionResult({
                type: 'full-reset',
                success: false,
                message: `Full reset failed: ${error?.message || error}`,
                details: []
              });
            } finally {
              setIsLoading(false);
            }
          }
        }
      ]
    );
  };
  
  // Render the diagnosis tab
  const renderDiagnosisTab = () => {
    if (!debugInfo) return null;
    
    return (
      <ScrollView style={styles.debugInfo}>
        {/* Session State */}
        <View style={styles.debugSection}>
          <Text style={styles.debugSectionTitle}>
            <Ionicons name="key-outline" size={16} color="#FFFFFF" style={styles.sectionIcon} />
            Session Status
          </Text>
          <View style={styles.debugItem}>
            <Text style={styles.debugLabel}>Authentication:</Text>
            <Text style={[
              styles.debugValue,
              debugInfo.tokenValidity.valid ? styles.successValue : styles.errorValue
            ]}>
              {debugInfo.tokenValidity.valid ? 'Valid' : 'Invalid Token'}
            </Text>
          </View>
          <View style={styles.debugItem}>
            <Text style={styles.debugLabel}>Has Session:</Text>
            <Text style={styles.debugValue}>
              {debugInfo.sessionState.hasSession ? 'Yes' : 'No'}
            </Text>
          </View>
          {debugInfo.sessionState.hasSession && (
            <>
              <View style={styles.debugItem}>
                <Text style={styles.debugLabel}>Status:</Text>
                <Text style={[
                  styles.debugValue,
                  debugInfo.sessionState.isExpired ? styles.errorValue : styles.successValue
                ]}>
                  {debugInfo.sessionState.isExpired ? 'Expired' : 'Active'}
                </Text>
              </View>
              {debugInfo.sessionState.expiresIn !== null && (
                <View style={styles.debugItem}>
                  <Text style={styles.debugLabel}>Expires In:</Text>
                  <Text style={[
                    styles.debugValue,
                    debugInfo.sessionState.expiresIn < 300 ? styles.warningValue : {}
                  ]}>
                    {formatExpiryTime(debugInfo.sessionState.expiresIn)}
                  </Text>
                </View>
              )}
            </>
          )}
          {!debugInfo.sessionState.hasSession && debugInfo.sessionState.refreshToken && (
            <View style={styles.debugItem}>
              <Text style={styles.debugLabel}>Refresh Token:</Text>
              <Text style={styles.warningValue}>Present but no active session</Text>
            </View>
          )}
        </View>
        
        {/* Network State */}
        <View style={styles.debugSection}>
          <Text style={styles.debugSectionTitle}>
            <Ionicons name="wifi-outline" size={16} color="#FFFFFF" style={styles.sectionIcon} />
            Network Status
          </Text>
          <View style={styles.debugItem}>
            <Text style={styles.debugLabel}>Connected:</Text>
            <Text style={[
              styles.debugValue,
              !debugInfo.networkState.isConnected ? styles.errorValue : {}
            ]}>
              {debugInfo.networkState.isConnected ? 'Yes' : 'No'}
            </Text>
          </View>
          <View style={styles.debugItem}>
            <Text style={styles.debugLabel}>Type:</Text>
            <Text style={styles.debugValue}>
              {debugInfo.networkState.type || 'Unknown'}
            </Text>
          </View>
          <View style={styles.debugItem}>
            <Text style={styles.debugLabel}>Internet Reachable:</Text>
            <Text style={[
              styles.debugValue,
              debugInfo.networkState.isInternetReachable === false ? styles.errorValue : {}
            ]}>
              {debugInfo.networkState.isInternetReachable === null
                ? 'Unknown'
                : debugInfo.networkState.isInternetReachable
                  ? 'Yes'
                  : 'No'}
            </Text>
          </View>
          {debugInfo.networkState.latency !== null && (
            <View style={styles.debugItem}>
              <Text style={styles.debugLabel}>Latency:</Text>
              <Text style={[
                styles.debugValue,
                debugInfo.networkState.latency > 500 ? styles.warningValue : {}
              ]}>
                {debugInfo.networkState.latency}ms
              </Text>
            </View>
          )}
        </View>
        
        {/* Supabase Connection */}
        <View style={styles.debugSection}>
          <Text style={styles.debugSectionTitle}>
            <Ionicons name="server-outline" size={16} color="#FFFFFF" style={styles.sectionIcon} />
            API Connection
          </Text>
          <View style={styles.debugItem}>
            <Text style={styles.debugLabel}>Can Connect:</Text>
            <Text style={[
              styles.debugValue,
              !debugInfo.connectionTest.canConnect ? styles.errorValue : styles.successValue
            ]}>
              {debugInfo.connectionTest.canConnect ? 'Yes' : 'No'}
            </Text>
          </View>
          <View style={styles.debugItem}>
            <Text style={styles.debugLabel}>Response Time:</Text>
            <Text style={[
              styles.debugValue,
              debugInfo.connectionTest.responseTime > 1000 ? styles.warningValue : {}
            ]}>
              {debugInfo.connectionTest.responseTime}ms
            </Text>
          </View>
          {debugInfo.connectionTest.error && (
            <View style={styles.debugItem}>
              <Text style={styles.debugLabel}>Error:</Text>
              <Text style={styles.errorValue} numberOfLines={2}>
                {debugInfo.connectionTest.error}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    );
  };
  
  // Render the repair tab
  const renderRepairTab = () => {
    return (
      <ScrollView style={styles.debugInfo}>
        <Text style={styles.helpText}>
          Choose an option to fix authentication issues:
        </Text>
        
        {/* Auto Fix */}
        <TouchableOpacity 
          style={styles.repairOption}
          onPress={handleFixSession}
          disabled={isLoading}
        >
          <View style={styles.repairOptionIconContainer}>
            <Ionicons name="medkit-outline" size={24} color="#32FFA5" />
          </View>
          <View style={styles.repairOptionContent}>
            <Text style={styles.repairOptionTitle}>Auto Fix Issues</Text>
            <Text style={styles.repairOptionDescription}>
              Automatically diagnose and fix common authentication problems
            </Text>
          </View>
        </TouchableOpacity>
        
        {/* Recover Session */}
        <TouchableOpacity 
          style={styles.repairOption}
          onPress={handleRecoverSession}
          disabled={isLoading}
        >
          <View style={styles.repairOptionIconContainer}>
            <Ionicons name="refresh-outline" size={24} color="#BE93FD" />
          </View>
          <View style={styles.repairOptionContent}>
            <Text style={styles.repairOptionTitle}>Recover Session</Text>
            <Text style={styles.repairOptionDescription}>
              Try to recover a broken session using existing refresh token
            </Text>
          </View>
        </TouchableOpacity>
        
        {/* Reset Session */}
        <TouchableOpacity 
          style={styles.repairOption}
          onPress={handleResetSession}
          disabled={isLoading}
        >
          <View style={styles.repairOptionIconContainer}>
            <Ionicons name="trash-outline" size={24} color="#FF93B9" />
          </View>
          <View style={styles.repairOptionContent}>
            <Text style={styles.repairOptionTitle}>Reset Session</Text>
            <Text style={styles.repairOptionDescription}>
              Clear session data and sign out (you'll need to sign in again)
            </Text>
          </View>
        </TouchableOpacity>
        
        {/* Full Reset */}
        <TouchableOpacity 
          style={styles.repairOption}
          onPress={handleFullReset}
          disabled={isLoading}
        >
          <View style={styles.repairOptionIconContainer}>
            <Ionicons name="nuclear-outline" size={24} color="#FF93B9" />
          </View>
          <View style={styles.repairOptionContent}>
            <Text style={styles.repairOptionTitle}>Full Reset</Text>
            <Text style={styles.repairOptionDescription}>
              Reset everything: auth, local data, and preferences
            </Text>
          </View>
        </TouchableOpacity>
      </ScrollView>
    );
  };
  
  // Render the advanced tab
  const renderAdvancedTab = () => {
    if (!debugInfo || !showAdvanced) return null;
    
    return (
      <ScrollView style={styles.debugInfo}>
        {/* Storage Keys */}
        <View style={styles.debugSection}>
          <Text style={styles.debugSectionTitle}>
            <Ionicons name="folder-outline" size={16} color="#FFFFFF" style={styles.sectionIcon} />
            Storage Keys
          </Text>
          {Object.keys(debugInfo.sessionStorage).length === 0 ? (
            <Text style={styles.debugText}>No session storage keys found</Text>
          ) : (
            Object.keys(debugInfo.sessionStorage).map((key) => (
              <View key={key} style={styles.debugItem}>
                <Text style={styles.debugLabel} numberOfLines={1}>{key}</Text>
                <Text style={styles.debugValue}>Present</Text>
              </View>
            ))
          )}
        </View>
        
        {/* Device Info */}
        <View style={styles.debugSection}>
          <Text style={styles.debugSectionTitle}>
            <Ionicons name="phone-portrait-outline" size={16} color="#FFFFFF" style={styles.sectionIcon} />
            Device Info
          </Text>
          <View style={styles.debugItem}>
            <Text style={styles.debugLabel}>Platform:</Text>
            <Text style={styles.debugValue}>
              {debugInfo.deviceInfo.platform} {debugInfo.deviceInfo.version}
            </Text>
          </View>
          <View style={styles.debugItem}>
            <Text style={styles.debugLabel}>Time:</Text>
            <Text style={styles.debugValue}>
              {new Date(debugInfo.timestamp).toLocaleTimeString()}
            </Text>
          </View>
        </View>
        
        {/* Raw Values (collapsible) */}
        {debugInfo.sessionState.user && (
          <View style={styles.debugSection}>
            <Text style={styles.debugSectionTitle}>
              <Ionicons name="person-outline" size={16} color="#FFFFFF" style={styles.sectionIcon} />
              User Data
            </Text>
            <View style={styles.debugItem}>
              <Text style={styles.debugLabel}>ID:</Text>
              <Text style={styles.debugValue} numberOfLines={1}>
                {debugInfo.sessionState.user.id}
              </Text>
            </View>
            <View style={styles.debugItem}>
              <Text style={styles.debugLabel}>Email:</Text>
              <Text style={styles.debugValue} numberOfLines={1}>
                {debugInfo.sessionState.user.email}
              </Text>
            </View>
          </View>
        )}
      </ScrollView>
    );
  };
  
  // Helper function to format expiry time
  const formatExpiryTime = (expiresInSeconds: number | null): string => {
    if (expiresInSeconds === null) return 'Unknown';
    
    if (expiresInSeconds <= 0) return 'Expired';
    
    if (expiresInSeconds < 60) {
      return `${expiresInSeconds} seconds`;
    }
    
    if (expiresInSeconds < 3600) {
      return `${Math.floor(expiresInSeconds / 60)} minutes`;
    }
    
    return `${Math.floor(expiresInSeconds / 3600)} hours`;
  };
  
  // Render the modal
  const renderModal = () => {
    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Session Diagnostics</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setIsModalVisible(false)}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
            
            {isLoading && !debugInfo ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#32FFA5" />
                <Text style={styles.loadingText}>Loading...</Text>
              </View>
            ) : (
              <>
                {/* Tab navigation */}
                <View style={styles.tabContainer}>
                  <TouchableOpacity
                    style={[styles.tab, activeTab === 'diagnosis' && styles.activeTab]}
                    onPress={() => setActiveTab('diagnosis')}
                  >
                    <Ionicons 
                      name="analytics-outline" 
                      size={18} 
                      color={activeTab === 'diagnosis' ? '#32FFA5' : '#FFFFFF'} 
                      style={styles.tabIcon}
                    />
                    <Text style={[
                      styles.tabText, 
                      activeTab === 'diagnosis' && styles.activeTabText
                    ]}>
                      Diagnosis
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[styles.tab, activeTab === 'repair' && styles.activeTab]}
                    onPress={() => setActiveTab('repair')}
                  >
                    <Ionicons 
                      name="construct-outline" 
                      size={18} 
                      color={activeTab === 'repair' ? '#32FFA5' : '#FFFFFF'} 
                      style={styles.tabIcon}
                    />
                    <Text style={[
                      styles.tabText, 
                      activeTab === 'repair' && styles.activeTabText
                    ]}>
                      Repair
                    </Text>
                  </TouchableOpacity>
                  
                  {showAdvanced && (
                    <TouchableOpacity
                      style={[styles.tab, activeTab === 'advanced' && styles.activeTab]}
                      onPress={() => setActiveTab('advanced')}
                    >
                      <Ionicons 
                        name="code-outline" 
                        size={18} 
                        color={activeTab === 'advanced' ? '#32FFA5' : '#FFFFFF'} 
                        style={styles.tabIcon}
                      />
                      <Text style={[
                        styles.tabText, 
                        activeTab === 'advanced' && styles.activeTabText
                      ]}>
                        Advanced
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
                
                {/* Action result message */}
                {actionResult && (
                  <View style={[
                    styles.resultContainer,
                    actionResult.success ? styles.successResult : styles.errorResult
                  ]}>
                    <Text style={styles.resultMessage}>{actionResult.message}</Text>
                    {actionResult.details && actionResult.details.length > 0 && (
                      <View style={styles.resultDetails}>
                        {actionResult.details.map((detail: string, index: number) => (
                          <Text key={index} style={styles.resultDetailItem}>
                            • {detail}
                          </Text>
                        ))}
                      </View>
                    )}
                  </View>
                )}
                
                {/* Tab content */}
                {activeTab === 'diagnosis' && renderDiagnosisTab()}
                {activeTab === 'repair' && renderRepairTab()}
                {activeTab === 'advanced' && renderAdvancedTab()}
                
                {/* Footer actions */}
                <View style={styles.footerActions}>
                  <TouchableOpacity
                    style={styles.footerButton}
                    onPress={collectDebugInfo}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <Text style={styles.footerButtonText}>Refresh</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    );
  };
  
  // Get position styles based on floatingPosition prop
  const getPositionStyle = () => {
    switch (floatingPosition) {
      case 'bottom-left':
        return { bottom: 20, left: 20 };
      case 'top-right':
        return { top: 80, right: 20 };
      case 'top-left':
        return { top: 80, left: 20 };
      case 'bottom-right':
      default:
        return { bottom: 20, right: 20 };
    }
  };
  
  // Main render
  return (
    <>
      <TouchableOpacity 
        style={[styles.debugButton, getPositionStyle()]}
        onPress={handleDebugPress}
      >
        <Ionicons name="bug-outline" size={24} color="#32FFA5" />
      </TouchableOpacity>
      
      {renderModal()}
    </>
  );
};

const styles = StyleSheet.create({
  debugButton: {
    position: 'absolute',
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#2A2A2A',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
    zIndex: 100,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  modalTitle: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 18,
  },
  closeButton: {
    padding: 4,
  },
  closeButtonText: {
    color: '#FFFFFF',
    fontSize: 20,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#252525',
    padding: 8,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#32FFA5',
  },
  tabText: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#32FFA5',
  },
  tabIcon: {
    marginRight: 4,
  },
  loadingContainer: {
    padding: 24,
    alignItems: 'center',
  },
  loadingText: {
    color: '#BBBBBB',
    marginTop: 12,
  },
  resultContainer: {
    margin: 16,
    padding: 12,
    borderRadius: 8,
  },
  successResult: {
    backgroundColor: 'rgba(50, 255, 165, 0.2)',
  },
  errorResult: {
    backgroundColor: 'rgba(255, 147, 185, 0.2)',
  },
  resultMessage: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  resultDetails: {
    marginTop: 8,
  },
  resultDetailItem: {
    color: '#BBBBBB',
    fontSize: 14,
    marginVertical: 2,
  },
  debugInfo: {
    padding: 16,
    maxHeight: 400,
  },
  debugSection: {
    marginBottom: 20,
  },
  debugSectionTitle: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    paddingBottom: 6,
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionIcon: {
    marginRight: 6,
  },
  debugItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  debugLabel: {
    color: '#BBBBBB',
    flex: 1,
  },
  debugValue: {
    color: '#FFFFFF',
    fontWeight: '500',
    maxWidth: '60%',
  },
  debugText: {
    color: '#BBBBBB',
  },
  errorValue: {
    color: '#FF93B9',
  },
  warningValue: {
    color: '#BE93FD',
  },
  successValue: {
    color: '#32FFA5',
  },
  footerActions: {
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#333',
    alignItems: 'center',
  },
  footerButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#333',
    borderRadius: 6,
  },
  footerButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  helpText: {
    color: '#BBBBBB',
    marginBottom: 16,
    textAlign: 'center',
  },
  repairOption: {
    flexDirection: 'row',
    backgroundColor: '#252525',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    alignItems: 'center',
  },
  repairOptionIconContainer: {
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  repairOptionContent: {
    flex: 1,
  },
  repairOptionTitle: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
    marginBottom: 4,
  },
  repairOptionDescription: {
    color: '#BBBBBB',
    fontSize: 12,
  },
});

// Default export for Expo Router compatibility
export default SessionDebugButton; 