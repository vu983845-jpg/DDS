export const dictionaries = {
    vi: {
        // Top Header
        appSubtitle: 'Đánh giá hoạt động sản xuất hàng ngày',
        searchPlaceholder: 'Tìm kiếm máy móc, lý do...',
        today: 'Hôm nay',
        yesterday: 'Hôm qua',
        customRange: 'Tùy chỉnh...',
        addIssue: '+ Thêm sự cố mới',
        dashboard: 'Bảng điều khiển',
        issuesList: 'Danh sách Sự cố',
        safetyLogs: 'Cảnh báo An toàn',
        adminSettings: 'Cài đặt Quản trị',
        logout: 'Đăng xuất',
        guest: 'Khách',
        tvMode: 'Bật Chế độ TV',
        normalMode: 'Tắt Chế độ TV',
        vi: 'Tiếng Việt',
        en: 'Tiếng Anh',

        // Dashboard
        kpiTotalIssues: 'Tổng số Sự cố',
        kpiTotalIssuesDesc: 'Cần xử lý / Tồn đọng',
        kpiDowntime: 'Tổng Downtime',
        kpiDowntimeDesc: 'Trong 24 giờ qua',
        kpiTopDept: 'Phòng ban Sự cố',
        kpiTopDeptDesc: 'Ngày hôm qua',
        kpiSafety: 'Cảnh báo An toàn',
        kpiSafetyDesc: 'Đang mở',
        lastUpdated: 'Cập nhật lần cuối:',

        issuesToReview: 'Danh sách Cần đánh giá',
        issuesToReviewDesc: 'Các sự cố được ghi nhận trong 24h qua.',
        allDepts: 'Tất cả PB',
        open: 'Mở',
        dept: 'Phòng ban',
        issue: 'Sự cố',
        status: 'Trạng thái',
        downtime: 'Downtime',
        noIssuesRange: 'Không có sự cố nào cho khoảng thời gian này.',
        generalArea: 'Khu vực chung',

        safetyTriggers: 'Cảnh báo An toàn',
        safetyTriggersDesc: 'Các vấn đề an toàn đang cần chú ý.',
        action: 'Hành động:',
        noSafety: 'Không có cảnh báo an toàn nào đang bật. Tuyệt vời!',

        // Issues Page
        allIssues: 'Tất cả Sự cố',
        issuesDesc: 'Lọc, tìm kiếm, và xuất dữ liệu sự cố.',
        exportCsv: 'Xuất CSV',
        machineArea: 'Máy móc / Khu vực',
        reason: 'Lý do',
        dateTime: 'Ngày/Giờ',
        noFilteredIssues: 'Không tìm thấy sự cố nào phù hợp với bộ lọc của bạn.',

        // Safety Page
        manageSafety: 'Quản lý các quan sát về môi trường, sức khỏe và an toàn.',
        reportSafety: '+ Báo cáo An toàn',
        date: 'Ngày',
        severity: 'Mức độ',
        description: 'Mô tả',
        requiredAction: 'Hành động yêu cầu',
        actions: 'Tùy chọn',
        noOutstandingSafety: 'Không có cảnh báo an toàn nào còn tồn đọng.',

        ddsNotes: 'Ghi chú DDS & Hành động',
        noNotes: 'Chưa có ghi chú nào được lưu hôm nay.',
        addNote: '+ Thêm Ghi chú',

        // Global
        close: 'Đóng',
        cancel: 'Hủy',
        save: 'Lưu',
        delete: 'Xóa',
    },
    en: {
        // Top Header
        appSubtitle: 'Daily Manufacturing Standup Review',
        searchPlaceholder: 'Search machine, reason...',
        today: 'Today',
        yesterday: 'Yesterday',
        customRange: 'Custom Range...',
        addIssue: '+ Add New Issue',
        dashboard: 'Dashboard',
        issuesList: 'Issues List',
        safetyLogs: 'Safety Logs',
        adminSettings: 'Admin Settings',
        logout: 'Log out',
        guest: 'Guest',
        tvMode: 'Enable TV Mode',
        normalMode: 'Disable TV Mode',
        vi: 'Vietnamese',
        en: 'English',

        // Dashboard
        kpiTotalIssues: 'Total Issues',
        kpiTotalIssuesDesc: 'Open / Pending',
        kpiDowntime: 'Total Downtime',
        kpiDowntimeDesc: 'Last 24 hours',
        kpiTopDept: 'Top Dept Issue',
        kpiTopDeptDesc: 'Yesterday',
        kpiSafety: 'Safety Triggers',
        kpiSafetyDesc: 'Currently Open',
        lastUpdated: 'Last updated:',

        issuesToReview: 'Issues to Review',
        issuesToReviewDesc: 'Recent issues logged in the last 24 hours.',
        allDepts: 'All Depts',
        open: 'Open',
        dept: 'Dept',
        issue: 'Issue',
        status: 'Status',
        downtime: 'Downtime',
        noIssuesRange: 'No issues found for the selected date range.',
        generalArea: 'General Area',

        safetyTriggers: 'Safety Triggers',
        safetyTriggersDesc: 'Active safety concerns requiring attention.',
        action: 'Action:',
        noSafety: 'No active safety triggers. Awesome!',

        // Issues Page
        allIssues: 'All Issues',
        issuesDesc: 'Filter, search, and export issue records.',
        exportCsv: 'Export CSV',
        machineArea: 'Machine / Area',
        reason: 'Reason',
        dateTime: 'Date/Time',
        noFilteredIssues: 'No issues found matching your filters.',

        // Safety Page
        manageSafety: 'Manage environmental, health, and safety observations.',
        reportSafety: '+ Report Safety Issue',
        date: 'Date',
        severity: 'Severity',
        description: 'Description',
        requiredAction: 'Required Action',
        actions: 'Actions',
        noOutstandingSafety: 'No outstanding safety triggers.',

        ddsNotes: 'DDS Notes & Actions',
        noNotes: 'No notes recorded for today yet.',
        addNote: '+ Add Note',

        // Global
        close: 'Close',
        cancel: 'Cancel',
        save: 'Save',
        delete: 'Delete',
    }
};

export type Language = 'en' | 'vi';
export type Dictionary = typeof dictionaries.en;
