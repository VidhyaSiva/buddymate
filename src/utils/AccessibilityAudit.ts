/**
 * Comprehensive accessibility audit system
 * Validates WCAG compliance and senior-specific accessibility requirements
 */

import { Dimensions, AccessibilityInfo } from 'react-native';
import { theme } from '../themes/AppTheme';

export interface AccessibilityIssue {
  id: string;
  severity: 'error' | 'warning' | 'info';
  category: 'color' | 'typography' | 'touch' | 'navigation' | 'content' | 'motion';
  message: string;
  element?: string;
  recommendation: string;
  wcagCriterion?: string;
}

export interface AccessibilityAuditResult {
  score: number; // 0-100
  totalIssues: number;
  issuesBySeverity: {
    error: number;
    warning: number;
    info: number;
  };
  issuesByCategory: Record<string, number>;
  issues: AccessibilityIssue[];
  recommendations: string[];
}

export class AccessibilityAudit {
  private static instance: AccessibilityAudit;
  private issues: AccessibilityIssue[] = [];

  public static getInstance(): AccessibilityAudit {
    if (!AccessibilityAudit.instance) {
      AccessibilityAudit.instance = new AccessibilityAudit();
    }
    return AccessibilityAudit.instance;
  }

  public async performFullAudit(): Promise<AccessibilityAuditResult> {
    this.issues = [];

    // Run all audit checks
    await this.auditColorContrast();
    await this.auditTypography();
    await this.auditTouchTargets();
    await this.auditNavigation();
    await this.auditContent();
    await this.auditMotionAndAnimation();
    await this.auditScreenReader();
    await this.auditKeyboardNavigation();

    return this.generateAuditResult();
  }

  private async auditColorContrast(): Promise<void> {
    // Check primary text contrast
    const primaryTextContrast = this.calculateContrastRatio(
      theme.colors.text.primary,
      theme.colors.background.primary
    );

    if (primaryTextContrast < 4.5) {
      this.addIssue({
        severity: 'error',
        category: 'color',
        message: `Primary text contrast ratio is ${primaryTextContrast.toFixed(2)}, below WCAG AA requirement of 4.5:1`,
        recommendation: 'Use darker text color or lighter background to improve contrast',
        wcagCriterion: '1.4.3 Contrast (Minimum)'
      });
    }

    // Check secondary text contrast
    const secondaryTextContrast = this.calculateContrastRatio(
      theme.colors.text.secondary,
      theme.colors.background.primary
    );

    if (secondaryTextContrast < 4.5) {
      this.addIssue({
        severity: 'warning',
        category: 'color',
        message: `Secondary text contrast ratio is ${secondaryTextContrast.toFixed(2)}, below WCAG AA requirement`,
        recommendation: 'Consider using darker secondary text color for better readability',
        wcagCriterion: '1.4.3 Contrast (Minimum)'
      });
    }

    // Check button contrast
    const buttonContrast = this.calculateContrastRatio(
      theme.colors.text.inverse,
      theme.colors.primary[500]
    );

    if (buttonContrast < 4.5) {
      this.addIssue({
        severity: 'error',
        category: 'color',
        message: `Button text contrast ratio is ${buttonContrast.toFixed(2)}, below WCAG AA requirement`,
        recommendation: 'Adjust button background or text color for better contrast',
        wcagCriterion: '1.4.3 Contrast (Minimum)'
      });
    }

    // Check emergency button contrast
    const emergencyContrast = this.calculateContrastRatio(
      theme.colors.text.inverse,
      theme.colors.emergency[500]
    );

    if (emergencyContrast < 7.0) {
      this.addIssue({
        severity: 'warning',
        category: 'color',
        message: `Emergency button should have enhanced contrast ratio of 7:1 for critical actions`,
        recommendation: 'Consider using higher contrast colors for emergency elements',
        wcagCriterion: '1.4.6 Contrast (Enhanced)'
      });
    }
  }

  private async auditTypography(): Promise<void> {
    // Check minimum font sizes
    const minFontSize = Math.min(...Object.values(theme.typography.fontSize));
    if (minFontSize < 18) {
      this.addIssue({
        severity: 'error',
        category: 'typography',
        message: `Minimum font size is ${minFontSize}px, below recommended 18px for seniors`,
        recommendation: 'Increase all font sizes to minimum 18px for better readability',
        wcagCriterion: '1.4.4 Resize text'
      });
    }

    // Check line height ratios
    Object.entries(theme.typography.fontSize).forEach(([size, fontSize]) => {
      const lineHeight = theme.typography.lineHeight[size as keyof typeof theme.typography.lineHeight];
      const ratio = lineHeight / fontSize;
      
      if (ratio < 1.4) {
        this.addIssue({
          severity: 'warning',
          category: 'typography',
          message: `Line height ratio for ${size} text is ${ratio.toFixed(2)}, below recommended 1.4`,
          recommendation: 'Increase line height for better text readability',
          wcagCriterion: '1.4.8 Visual Presentation'
        });
      }
    });

    // Check font weight availability
    const availableWeights = Object.keys(theme.typography.fontWeight);
    if (availableWeights.length < 3) {
      this.addIssue({
        severity: 'info',
        category: 'typography',
        message: 'Limited font weight options may reduce text hierarchy clarity',
        recommendation: 'Consider adding more font weight options for better content hierarchy'
      });
    }
  }

  private async auditTouchTargets(): Promise<void> {
    // Check minimum touch target sizes
    const minTouchTarget = Math.min(...Object.values(theme.layout.touchTarget));
    if (minTouchTarget < 44) {
      this.addIssue({
        severity: 'error',
        category: 'touch',
        message: `Minimum touch target size is ${minTouchTarget}px, below WCAG requirement of 44px`,
        recommendation: 'Ensure all interactive elements are at least 44x44px',
        wcagCriterion: '2.5.5 Target Size'
      });
    }

    // Check button heights
    Object.entries(theme.components.button.height).forEach(([size, height]) => {
      if (height < 44) {
        this.addIssue({
          severity: 'error',
          category: 'touch',
          message: `${size} button height is ${height}px, below minimum 44px requirement`,
          recommendation: 'Increase button height to at least 44px',
          wcagCriterion: '2.5.5 Target Size'
        });
      }
    });

    // Check spacing between touch targets
    if (theme.spacing.sm < 8) {
      this.addIssue({
        severity: 'warning',
        category: 'touch',
        message: 'Small spacing between elements may cause accidental touches',
        recommendation: 'Ensure minimum 8px spacing between interactive elements'
      });
    }
  }

  private async auditNavigation(): Promise<void> {
    // Check tab bar height for easy access
    if (theme.layout.tabBar.height < 60) {
      this.addIssue({
        severity: 'warning',
        category: 'navigation',
        message: `Tab bar height is ${theme.layout.tabBar.height}px, may be difficult for seniors to use`,
        recommendation: 'Consider increasing tab bar height to at least 60px for easier access'
      });
    }

    // Check header height
    if (theme.layout.header.default < 60) {
      this.addIssue({
        severity: 'info',
        category: 'navigation',
        message: 'Header height may be too small for clear navigation elements',
        recommendation: 'Consider larger header height for better touch targets'
      });
    }
  }

  private async auditContent(): Promise<void> {
    // Check card minimum height for content readability
    if (theme.layout.card.minHeight < 100) {
      this.addIssue({
        severity: 'warning',
        category: 'content',
        message: 'Card minimum height may be too small for readable content',
        recommendation: 'Increase card minimum height for better content presentation'
      });
    }

    // Check modal padding for content spacing
    if (theme.components.modal.padding < 24) {
      this.addIssue({
        severity: 'info',
        category: 'content',
        message: 'Modal padding may be insufficient for comfortable reading',
        recommendation: 'Increase modal padding for better content spacing'
      });
    }
  }

  private async auditMotionAndAnimation(): Promise<void> {
    // Check animation durations for seniors
    Object.entries(theme.animations.duration).forEach(([speed, duration]) => {
      if (duration < 200 && speed === 'fast') {
        this.addIssue({
          severity: 'warning',
          category: 'motion',
          message: `Fast animation duration of ${duration}ms may be too quick for seniors`,
          recommendation: 'Consider slower animation speeds for better user experience',
          wcagCriterion: '2.2.2 Pause, Stop, Hide'
        });
      }
    });

    // Check for reduce motion support
    try {
      const reduceMotionEnabled = await AccessibilityInfo.isReduceMotionEnabled();
      if (!theme.accessibility.reduceMotion) {
        this.addIssue({
          severity: 'error',
          category: 'motion',
          message: 'No reduce motion configuration found',
          recommendation: 'Implement reduce motion support for users with vestibular disorders',
          wcagCriterion: '2.3.3 Animation from Interactions'
        });
      }
    } catch (error) {
      this.addIssue({
        severity: 'warning',
        category: 'motion',
        message: 'Unable to check reduce motion preference',
        recommendation: 'Ensure reduce motion support is properly implemented'
      });
    }
  }

  private async auditScreenReader(): Promise<void> {
    try {
      const screenReaderEnabled = await AccessibilityInfo.isScreenReaderEnabled();
      
      // This is more of a runtime check, but we can verify theme support
      if (!theme.accessibility.focus) {
        this.addIssue({
          severity: 'error',
          category: 'content',
          message: 'No focus indicator configuration found',
          recommendation: 'Implement clear focus indicators for keyboard and screen reader navigation',
          wcagCriterion: '2.4.7 Focus Visible'
        });
      }

      // Check focus indicator contrast
      if (theme.accessibility.focus) {
        const focusContrast = this.calculateContrastRatio(
          theme.accessibility.focus.borderColor,
          theme.colors.background.primary
        );

        if (focusContrast < 3.0) {
          this.addIssue({
            severity: 'error',
            category: 'color',
            message: `Focus indicator contrast ratio is ${focusContrast.toFixed(2)}, below minimum 3:1`,
            recommendation: 'Use higher contrast color for focus indicators',
            wcagCriterion: '1.4.11 Non-text Contrast'
          });
        }
      }
    } catch (error) {
      this.addIssue({
        severity: 'info',
        category: 'content',
        message: 'Unable to check screen reader status',
        recommendation: 'Ensure proper screen reader support is implemented'
      });
    }
  }

  private async auditKeyboardNavigation(): Promise<void> {
    // Check focus indicator border width
    if (theme.accessibility.focus && theme.accessibility.focus.borderWidth < 2) {
      this.addIssue({
        severity: 'warning',
        category: 'navigation',
        message: 'Focus indicator border width may be too thin for visibility',
        recommendation: 'Use at least 2px border width for focus indicators'
      });
    }
  }

  private calculateContrastRatio(foreground: string, background: string): number {
    // Convert hex colors to RGB
    const fgRgb = this.hexToRgb(foreground);
    const bgRgb = this.hexToRgb(background);

    if (!fgRgb || !bgRgb) return 0;

    // Calculate relative luminance
    const fgLuminance = this.getRelativeLuminance(fgRgb);
    const bgLuminance = this.getRelativeLuminance(bgRgb);

    // Calculate contrast ratio
    const lighter = Math.max(fgLuminance, bgLuminance);
    const darker = Math.min(fgLuminance, bgLuminance);

    return (lighter + 0.05) / (darker + 0.05);
  }

  private hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }

  private getRelativeLuminance(rgb: { r: number; g: number; b: number }): number {
    const { r, g, b } = rgb;
    
    const [rs, gs, bs] = [r, g, b].map(c => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });

    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  }

  private addIssue(issue: Omit<AccessibilityIssue, 'id'>): void {
    this.issues.push({
      id: `issue_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...issue
    });
  }

  private generateAuditResult(): AccessibilityAuditResult {
    const totalIssues = this.issues.length;
    const maxScore = 100;
    
    // Calculate score based on issue severity
    const errorPenalty = this.issues.filter(i => i.severity === 'error').length * 10;
    const warningPenalty = this.issues.filter(i => i.severity === 'warning').length * 5;
    const infoPenalty = this.issues.filter(i => i.severity === 'info').length * 1;
    
    const score = Math.max(0, maxScore - errorPenalty - warningPenalty - infoPenalty);

    const issuesBySeverity = {
      error: this.issues.filter(i => i.severity === 'error').length,
      warning: this.issues.filter(i => i.severity === 'warning').length,
      info: this.issues.filter(i => i.severity === 'info').length,
    };

    const issuesByCategory: Record<string, number> = {};
    this.issues.forEach(issue => {
      issuesByCategory[issue.category] = (issuesByCategory[issue.category] || 0) + 1;
    });

    const recommendations = [
      'Ensure all text meets WCAG AA contrast requirements (4.5:1)',
      'Use minimum 18px font size for senior-friendly readability',
      'Maintain 44px minimum touch target size for all interactive elements',
      'Implement clear focus indicators for keyboard navigation',
      'Provide reduce motion support for users with vestibular disorders',
      'Test with actual screen readers and senior users',
      'Consider enhanced contrast (7:1) for critical actions like emergency buttons'
    ];

    return {
      score,
      totalIssues,
      issuesBySeverity,
      issuesByCategory,
      issues: this.issues,
      recommendations
    };
  }

  public async generateAccessibilityReport(): Promise<string> {
    const result = await this.performFullAudit();
    
    let report = `# Accessibility Audit Report\n\n`;
    report += `**Overall Score:** ${result.score}/100\n`;
    report += `**Total Issues:** ${result.totalIssues}\n\n`;

    report += `## Issues by Severity\n`;
    report += `- Errors: ${result.issuesBySeverity.error}\n`;
    report += `- Warnings: ${result.issuesBySeverity.warning}\n`;
    report += `- Info: ${result.issuesBySeverity.info}\n\n`;

    report += `## Issues by Category\n`;
    Object.entries(result.issuesByCategory).forEach(([category, count]) => {
      report += `- ${category}: ${count}\n`;
    });

    report += `\n## Detailed Issues\n\n`;
    result.issues.forEach((issue, index) => {
      report += `### ${index + 1}. ${issue.message}\n`;
      report += `**Severity:** ${issue.severity}\n`;
      report += `**Category:** ${issue.category}\n`;
      if (issue.wcagCriterion) {
        report += `**WCAG Criterion:** ${issue.wcagCriterion}\n`;
      }
      report += `**Recommendation:** ${issue.recommendation}\n\n`;
    });

    report += `## General Recommendations\n\n`;
    result.recommendations.forEach((rec, index) => {
      report += `${index + 1}. ${rec}\n`;
    });

    return report;
  }
}