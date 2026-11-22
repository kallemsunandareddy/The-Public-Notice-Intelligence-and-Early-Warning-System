import { NoticeItem } from '../types';

/**
 * Trusted Government Domains list
 */
export const TRUSTED_GOV_DOMAINS = [
  'telangana.gov.in',
  'hyderabadwater.gov.in',
  'ghmc.gov.in',
  'cyberabadpolice.gov.in',
  'tspolice.gov.in',
  'cgg.gov.in',
  'telanganaepass.cgg.gov.in',
  'chfw.telangana.gov.in',
  'tssspdcl.com',
  'tsnpdcl.in',
  'gov.in',
  'nic.in',
  'india.gov.in'
];

export type NoticeOriginType = 'DEMO' | 'PENDING_VERIFICATION' | 'AUTHENTIC_GOVERNMENT' | 'UNVERIFIED_REJECTED';

export interface VerificationAuditResult {
  originType: NoticeOriginType;
  badgeLabel: string;
  badgeClass: string;
  isDemo: boolean;
  isAuthentic: boolean;
  domainName?: string;
  isTrustedDomain: boolean;
  hasOfficialReference: boolean;
  details: string;
}

/**
 * Audits a notice to detect whether it is a demonstration document,
 * pending verification, an authentic verified government notice, or unverified.
 */
export function auditNoticeAuthenticity(notice: NoticeItem): VerificationAuditResult {
  const title = (notice.title || '').toLowerCase();
  const authority = (notice.authority || '').toLowerCase();
  const originalText = (notice.original_text || '').toLowerCase();
  const summary = (notice.summary || '').toLowerCase();
  const docPath = (notice.document_url || notice.file_type || '').toLowerCase();
  const ref = (notice.contact_info || '').toLowerCase();
  const sourceUrl = (notice.source_url || '').toLowerCase();

  // 1. Check for Demo / Sample characteristics
  const isDemo = 
    title.includes('sample') ||
    title.includes('demonstration') ||
    title.includes('demo') ||
    authority.includes('demo') ||
    authority.includes('placeholder') ||
    ref.includes('demo') ||
    originalText.includes('sample document') ||
    originalText.includes('for project demonstration') ||
    originalText.includes('fictional notice') ||
    originalText.includes('demo only — no official signature') ||
    summary.includes('demonstration notice') ||
    summary.includes('fictional');

  if (isDemo) {
    return {
      originType: 'DEMO',
      badgeLabel: 'DEMO DOCUMENT',
      badgeClass: 'bg-amber-100 text-amber-800 border-amber-300',
      isDemo: true,
      isAuthentic: false,
      isTrustedDomain: false,
      hasOfficialReference: false,
      details: 'Demonstration / Sample Document: Not an official government circular.'
    };
  }

  // 2. Check if rejected
  if (notice.status === 'REJECTED') {
    return {
      originType: 'UNVERIFIED_REJECTED',
      badgeLabel: 'NOT OFFICIALLY VERIFIED',
      badgeClass: 'bg-red-100 text-red-800 border-red-300',
      isDemo: false,
      isAuthentic: false,
      isTrustedDomain: false,
      hasOfficialReference: Boolean(notice.contact_info),
      details: notice.verification_notes || 'Failed official government verification audit.'
    };
  }

  // 3. Extract and check source URL against trusted domains
  let domainName = '';
  let isTrustedDomain = false;

  if (sourceUrl) {
    try {
      const parsed = new URL(sourceUrl.startsWith('http') ? sourceUrl : `https://${sourceUrl}`);
      domainName = parsed.hostname;
      isTrustedDomain = TRUSTED_GOV_DOMAINS.some(trusted => 
        domainName === trusted || domainName.endsWith('.' + trusted)
      );
    } catch {
      domainName = sourceUrl;
      isTrustedDomain = TRUSTED_GOV_DOMAINS.some(trusted => sourceUrl.includes(trusted));
    }
  }

  const hasOfficialReference = Boolean(
    notice.contact_info && 
    notice.contact_info.length > 4 && 
    !notice.contact_info.toLowerCase().includes('pending')
  );

  // 4. Check if officially verified & authentic
  // Must have passed human workflow (VERIFIED, APPROVED, or PUBLISHED) AND have trusted domain or official reference
  if (
    (notice.status === 'VERIFIED' || notice.status === 'APPROVED' || notice.status === 'PUBLISHED') &&
    (isTrustedDomain || hasOfficialReference)
  ) {
    return {
      originType: 'AUTHENTIC_GOVERNMENT',
      badgeLabel: 'VERIFIED AUTHENTIC',
      badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      isDemo: false,
      isAuthentic: true,
      domainName,
      isTrustedDomain,
      hasOfficialReference,
      details: `Authentic circular verified from ${domainName || 'Government Source'} (Ref: ${notice.contact_info || 'Official Gazette'}).`
    };
  }

  // 5. Default to Pending Verification
  return {
    originType: 'PENDING_VERIFICATION',
    badgeLabel: 'PENDING VERIFICATION',
    badgeClass: 'bg-blue-100 text-blue-800 border-blue-300',
    isDemo: false,
    isAuthentic: false,
    domainName,
    isTrustedDomain,
    hasOfficialReference,
    details: 'Uploaded document awaiting authenticity check against official government gazette.'
  };
}
