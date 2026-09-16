import React, { useEffect, useState } from "react";
import { 
  View,
  StyleSheet,
  SafeAreaView,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  TextInput,
  Image,
  Alert
} from "react-native";
import { LineChart } from "react-native-gifted-charts";
import { supabase } from "./supabase";

export default function ProfileScreen({ navigation }) {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState("student"); // "student", "alumni", or "business"
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Analytics states
  const [chartLoading, setChartLoading] = useState(true);
  const [chartData1, setChartData1] = useState([]);
  const [chartData2, setChartData2] = useState([]);
  const [metricSummary, setMetricSummary] = useState({});
  const [applicantStats, setApplicantStats] = useState({
    totalApplications: 0,
    fields: [],
    years: []
  });

  // Profile Form Fields (Student / Alumni)
  const [fullName, setFullName] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [moduleName, setModuleName] = useState("");
  const [courseName, setCourseName] = useState("");
  const [enrollmentYear, setEnrollmentYear] = useState("");
  const [graduationYear, setGraduationYear] = useState("");
  const [workExperience, setWorkExperience] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [location, setLocation] = useState("");
  const [bio, setBio] = useState("");

  // Profile Form Fields (Business)
  const [orgName, setOrgName] = useState("");
  const [industry, setIndustry] = useState("");
  const [companyDescription, setCompanyDescription] = useState("");
  const [siteLink, setSiteLink] = useState("");
  const [contactDetails, setContactDetails] = useState("");

  useEffect(() => {
    fetchUserProfileAndAnalytics();
  }, []);

  const fetchUserProfileAndAnalytics = async () => {
    setLoading(true);
    setChartLoading(true);

    const { data: { user: currentUser } } = await supabase.auth.getUser();
    
    if (currentUser) {
      setUser(currentUser);
      const meta = currentUser.user_metadata || {};
      const role = meta.user_role || "student";
      setUserRole(role);

      // Populate editable state from user metadata
      setFullName(meta.full_name || "Dimpho Junior Magoro");
      setPhotoUrl(meta.photo_url || "");
      setModuleName(meta.module_name || "Internet Programming 622A");
      setCourseName(meta.course_name || "BSc Information Technology");
      setEnrollmentYear(meta.enrollment_year || "2024");
      setGraduationYear(meta.graduation_year || "2026");
      setWorkExperience(meta.work_experience || "Embedded Software Developer");
      setLinkedinUrl(meta.linkedin_url || "https://linkedin.com");
      setLocation(meta.location || "Johannesburg, South Africa");
      setBio(meta.bio || "Passionate about tech and low-level systems.");

      // Business specific initializations
      setOrgName(meta.company_name || meta.full_name || "Nexus Corp");
      setIndustry(meta.industry || "Technology & Telecoms");
      setCompanyDescription(meta.company_description || "Leading provider of next-generation digital solutions.");
      setSiteLink(meta.site_link || "https://nexus.co.za");
      setContactDetails(meta.contact_details || "contact@nexus.co.za | +27 11 000 0000");

      if (role === "business") {
        // Fetch Business Metrics
        const { data: posts } = await supabase
          .from("posts")
          .select("id, comments_count, likes_count")
          .eq("author_id", currentUser.id);

        const postsCount = posts?.length || 12;
        const totalComments = posts?.reduce((sum, p) => sum + (p.comments_count || 0), 0) || 48;

        const { data: applications } = await supabase
          .from("job_applications")
          .select("id, applicant_field, applicant_year")
          .eq("business_id", currentUser.id);

        const totalApps = applications?.length || 64;

        setMetricSummary({
          stat1Label: "Total Posts",
          stat1Val: `${postsCount}`,
          stat2Label: "Post Comments",
          stat2Val: `${totalComments}`,
          stat3Label: "Job Applications",
          stat3Val: `${totalApps}`,
        });

        setApplicantStats({
          totalApplications: totalApps,
          fields: [
            { name: "Information Tech", count: 32, percentage: "50%" },
            { name: "Finance & Acc", count: 20, percentage: "31%" },
            { name: "Logistics", count: 12, percentage: "19%" },
          ],
          years: [
            { label: "3rd Year", count: 28, percentage: "44%" },
            { label: "Alumni", count: 18, percentage: "28%" },
            { label: "2nd Year", count: 12, percentage: "19%" },
            { label: "1st Year", count: 6, percentage: "9%" },
          ]
        });

        setChartData1([
          { value: 45, label: "Jan" },
          { value: 72, label: "Feb" },
          { value: 98, label: "Mar" },
          { value: 130, label: "Apr" },
          { value: 185, label: "May" },
        ]);

        setChartData2([
          { value: 12 },
          { value: 24 },
          { value: 35 },
          { value: 48 },
          { value: totalApps },
        ]);

      } else {
        // Fetch Student/Alumni Metrics
        const { data } = await supabase
          .from("user_analytics")
          .select("profile_views, job_readiness_score, ai_market_demand")
          .eq("user_id", currentUser.id)
          .maybeSingle();

        const views = data?.profile_views || 124;
        const readiness = data?.job_readiness_score || 72;
        const marketDemand = data?.ai_market_demand || 88;

        setMetricSummary({
          stat1Label: "Profile Views",
          stat1Val: `${views}`,
          stat2Label: "Job Readiness",
          stat2Val: `${readiness}%`,
          stat3Label: "AI Market Demand",
          stat3Val: `${marketDemand}%`,
        });

        setChartData1([
          { value: Math.max(0, readiness - 25), label: "Jan" },
          { value: Math.max(0, readiness - 18), label: "Feb" },
          { value: Math.max(0, readiness - 12), label: "Mar" },
          { value: Math.max(0, readiness - 5), label: "Apr" },
          { value: readiness, label: "May" },
        ]);

        setChartData2([
          { value: Math.max(0, marketDemand - 15) },
          { value: Math.max(0, marketDemand - 8) },
          { value: Math.max(0, marketDemand - 12) },
          { value: Math.max(0, marketDemand - 4) },
          { value: marketDemand },
        ]);
      }
    }

    setChartLoading(false);
    setLoading(false);
  };

  const handleSaveProfile = async () => {
    setSaving(true);

    const updatedData = userRole === "business" ? {
      company_name: orgName,
      industry: industry,
      company_description: companyDescription,
      location: location,
      site_link: siteLink,
      contact_details: contactDetails,
      photo_url: photoUrl,
    } : {
      full_name: fullName,
      photo_url: photoUrl,
      module_name: moduleName,
      course_name: courseName,
      enrollment_year: enrollmentYear,
      graduation_year: graduationYear,
      work_experience: workExperience,
      linkedin_url: linkedinUrl,
      location: location,
      bio: bio,
    };

    const { error } = await supabase.auth.updateUser({
      data: updatedData
    });

    setSaving(false);

    if (error) {
      Alert.alert("Error", error.message);
    } else {
      setIsEditing(false);
      Alert.alert("Success", "Profile details updated successfully!");
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigation.navigate("Welcome");
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, styles.loadingCenter]}>
        <ActivityIndicator color="#fff" size="large" />
      </SafeAreaView>
    );
  }

  const displayName = userRole === "business" ? orgName : fullName;
  const avatarInitial = displayName.charAt(0).toUpperCase();

  // Dynamic badge text calculation
  const getBadgeText = () => {
    if (userRole === "business") return "Verified Business Account";
    if (userRole === "alumni") return "Alumni Account";
    return "Student Account";
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Header Block */}
        <View style={styles.header}>
          {photoUrl ? (
            <Image source={{ uri: photoUrl }} style={styles.avatarImage} />
          ) : (
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{avatarInitial}</Text>
            </View>
          )}

          <Text style={styles.name}>{displayName}</Text>
          <Text style={styles.email}>{user?.email}</Text>
          <View style={styles.roleBadge}>
            <Text style={styles.roleBadgeText}>{getBadgeText()}</Text>
          </View>

          <Pressable 
            style={styles.editButton} 
            onPress={() => isEditing ? handleSaveProfile() : setIsEditing(true)}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color="#000" size="small" />
            ) : (
              <Text style={styles.editButtonText}>
                {isEditing ? "Save Changes" : "Edit Details"}
              </Text>
            )}
          </Pressable>
        </View>

        {/* Analytics Card */}
        <View style={styles.analyticsCard}>
          <View style={styles.analyticsHeader}>
            <Text style={styles.analyticsTitle}>
              {userRole === "business" ? "Recruitment Performance" : "Career Analytics"}
            </Text>
            {userRole === "business" && (
              <View style={styles.aiBadge}>
                <Text style={styles.aiBadgeText}>Richfield Talent Pool</Text>
              </View>
            )}
          </View>

          {chartLoading ? (
            <ActivityIndicator color="#fff" style={{ height: 180 }} />
          ) : (
            <>
              <View style={styles.statsRow}>
                <View style={styles.statBox}>
                  <Text style={styles.statLabel}>{metricSummary.stat1Label}</Text>
                  <Text style={[styles.statValue, { color: "#fff" }]}>
                    {metricSummary.stat1Val}
                  </Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={styles.statLabel}>{metricSummary.stat2Label}</Text>
                  <Text style={[styles.statValue, { color: "#177AD5" }]}>
                    {metricSummary.stat2Val}
                  </Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={styles.statLabel}>{metricSummary.stat3Label}</Text>
                  <Text style={[styles.statValue, { color: "#ED6665" }]}>
                    {metricSummary.stat3Val}
                  </Text>
                </View>
              </View>

              <View style={styles.chartWrapper}>
                <LineChart
                  data={chartData1}
                  data2={chartData2}
                  showLine2={true}
                  height={180}
                  spacing={52}
                  initialSpacing={15}
                  color1="#177AD5"
                  color2="#ED6665"
                  textColor1="#fff"
                  textColor2="#fff"
                  dataPointsColor1="#177AD5"
                  dataPointsColor2="#ED6665"
                  startFillColor1="rgba(23, 122, 213, 0.25)"
                  startFillColor2="rgba(237, 102, 101, 0.25)"
                  endFillColor1="rgba(23, 122, 213, 0.0)"
                  endFillColor2="rgba(237, 102, 101, 0.0)"
                  areaChart
                  yAxisTextStyle={{ color: "#aaa", fontSize: 10 }}
                  xAxisLabelTextStyle={{ color: "#aaa", fontSize: 10 }}
                  axisColor="#333"
                  rulesColor="#222"
                  maxValue={200}
                />
              </View>

              <View style={styles.legendRow}>
                <View style={styles.legendItem}>
                  <View style={[styles.dot, { backgroundColor: "#177AD5" }]} />
                  <Text style={styles.legendText}>
                    {userRole === "business" ? "Listing Views" : "Job Readiness"}
                  </Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.dot, { backgroundColor: "#ED6665" }]} />
                  <Text style={styles.legendText}>
                    {userRole === "business" ? "Applications" : "AI Market Demand"}
                  </Text>
                </View>
              </View>
            </>
          )}
        </View>

        {/* Dynamic Fields Section */}
        {userRole === "business" ? (
          /* BUSINESS PROFILE FIELDS */
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Company Information</Text>
            <View style={styles.card}>
              <View style={styles.detailsRow}>
                <Text style={styles.label}>Organization Name</Text>
                {isEditing ? (
                  <TextInput style={styles.input} value={orgName} onChangeText={setOrgName} />
                ) : (
                  <Text style={styles.value}>{orgName}</Text>
                )}
              </View>
              <View style={styles.separator} />

              <View style={styles.detailsRow}>
                <Text style={styles.label}>Industry</Text>
                {isEditing ? (
                  <TextInput style={styles.input} value={industry} onChangeText={setIndustry} />
                ) : (
                  <Text style={styles.value}>{industry}</Text>
                )}
              </View>
              <View style={styles.separator} />

              <View style={styles.detailsRow}>
                <Text style={styles.label}>Company Description</Text>
                {isEditing ? (
                  <TextInput style={[styles.input, styles.multilineInput]} value={companyDescription} onChangeText={setCompanyDescription} multiline />
                ) : (
                  <Text style={styles.value}>{companyDescription}</Text>
                )}
              </View>
              <View style={styles.separator} />

              <View style={styles.detailsRow}>
                <Text style={styles.label}>Location</Text>
                {isEditing ? (
                  <TextInput style={styles.input} value={location} onChangeText={setLocation} />
                ) : (
                  <Text style={styles.value}>{location}</Text>
                )}
              </View>
              <View style={styles.separator} />

              <View style={styles.detailsRow}>
                <Text style={styles.label}>Site Link</Text>
                {isEditing ? (
                  <TextInput style={styles.input} value={siteLink} onChangeText={setSiteLink} />
                ) : (
                  <Text style={[styles.value, { color: "#177AD5" }]}>{siteLink}</Text>
                )}
              </View>
              <View style={styles.separator} />

              <View style={styles.detailsRow}>
                <Text style={styles.label}>Contact Details</Text>
                {isEditing ? (
                  <TextInput style={styles.input} value={contactDetails} onChangeText={setContactDetails} />
                ) : (
                  <Text style={styles.value}>{contactDetails}</Text>
                )}
              </View>
            </View>

            {/* Applicant Demographics */}
            <Text style={[styles.sectionTitle, { marginTop: 25 }]}>Applicants Field Breakdown</Text>
            <View style={styles.card}>
              {applicantStats.fields.map((field, idx) => (
                <View key={field.name}>
                  <View style={styles.demoRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.demoLabel}>{field.name}</Text>
                      <Text style={styles.demoSubText}>{field.count} applicants</Text>
                    </View>
                    <Text style={styles.demoPercent}>{field.percentage}</Text>
                  </View>
                  {idx < applicantStats.fields.length - 1 && <View style={styles.separator} />}
                </View>
              ))}
            </View>
          </View>
        ) : (
          /* STUDENT / ALUMNI PROFILE FIELDS */
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Profile Details</Text>
            <View style={styles.card}>
              <View style={styles.detailsRow}>
                <Text style={styles.label}>Full Name</Text>
                {isEditing ? (
                  <TextInput style={styles.input} value={fullName} onChangeText={setFullName} />
                ) : (
                  <Text style={styles.value}>{fullName}</Text>
                )}
              </View>
              <View style={styles.separator} />

              <View style={styles.detailsRow}>
                <Text style={styles.label}>Profile Photo URL</Text>
                {isEditing ? (
                  <TextInput style={styles.input} value={photoUrl} onChangeText={setPhotoUrl} placeholder="https://..." placeholderTextColor="#555" />
                ) : (
                  <Text style={styles.value}>{photoUrl || "Default Initial Avatar"}</Text>
                )}
              </View>
              <View style={styles.separator} />

              <View style={styles.detailsRow}>
                <Text style={styles.label}>Module Name / Profession</Text>
                {isEditing ? (
                  <TextInput style={styles.input} value={moduleName} onChangeText={setModuleName} />
                ) : (
                  <Text style={styles.value}>{moduleName}</Text>
                )}
              </View>
              <View style={styles.separator} />

              <View style={styles.detailsRow}>
                <Text style={styles.label}>Course Name - Work Field</Text>
                {isEditing ? (
                  <TextInput style={styles.input} value={courseName} onChangeText={setCourseName} />
                ) : (
                  <Text style={styles.value}>{courseName}</Text>
                )}
              </View>
              <View style={styles.separator} />

              <View style={styles.detailsRow}>
                <Text style={styles.label}>Year of Enrollment - Graduation</Text>
                {isEditing ? (
                  <View style={{ flexDirection: "row", gap: 10 }}>
                    <TextInput style={[styles.input, { flex: 1 }]} value={enrollmentYear} onChangeText={setEnrollmentYear} placeholder="Enroll" placeholderTextColor="#555" />
                    <TextInput style={[styles.input, { flex: 1 }]} value={graduationYear} onChangeText={setGraduationYear} placeholder="Grad" placeholderTextColor="#555" />
                  </View>
                ) : (
                  <Text style={styles.value}>{enrollmentYear} - {graduationYear}</Text>
                )}
              </View>
              <View style={styles.separator} />

              <View style={styles.detailsRow}>
                <Text style={styles.label}>Work Experience</Text>
                {isEditing ? (
                  <TextInput style={[styles.input, styles.multilineInput]} value={workExperience} onChangeText={setWorkExperience} multiline />
                ) : (
                  <Text style={styles.value}>{workExperience}</Text>
                )}
              </View>
              <View style={styles.separator} />

              <View style={styles.detailsRow}>
                <Text style={styles.label}>LinkedIn Link</Text>
                {isEditing ? (
                  <TextInput style={styles.input} value={linkedinUrl} onChangeText={setLinkedinUrl} />
                ) : (
                  <Text style={[styles.value, { color: "#177AD5" }]}>{linkedinUrl}</Text>
                )}
              </View>
              <View style={styles.separator} />

              <View style={styles.detailsRow}>
                <Text style={styles.label}>Location</Text>
                {isEditing ? (
                  <TextInput style={styles.input} value={location} onChangeText={setLocation} />
                ) : (
                  <Text style={styles.value}>{location}</Text>
                )}
              </View>
              <View style={styles.separator} />

              <View style={styles.detailsRow}>
                <Text style={styles.label}>Bio / Extra Details</Text>
                {isEditing ? (
                  <TextInput 
                    style={[styles.input, styles.multilineInput]} 
                    value={bio} 
                    onChangeText={setBio} 
                    multiline 
                    placeholder="Type anything extra about yourself..." 
                    placeholderTextColor="#555"
                  />
                ) : (
                  <Text style={styles.value}>{bio}</Text>
                )}
              </View>
            </View>
          </View>
        )}

        {/* Log Out Button */}
        <Pressable style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Log Out</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  loadingCenter: {
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 25,
    paddingBottom: 50,
  },
  header: {
    alignItems: "center",
    marginBottom: 25,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarImage: {
    width: 90,
    height: 90,
    borderRadius: 45,
  },
  avatarText: {
    color: "#000",
    fontSize: 32,
    fontWeight: "600",
  },
  name: {
    color: "#fff",
    fontSize: 25,
    fontWeight: "600",
    marginTop: 15,
  },
  email: {
    color: "#777",
    fontSize: 14,
    marginTop: 4,
  },
  roleBadge: {
    backgroundColor: "#1c1c1c",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#333",
  },
  roleBadgeText: {
    color: "#aaa",
    fontSize: 11,
    fontWeight: "500",
  },
  editButton: {
    marginTop: 15,
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  editButtonText: {
    color: "#000",
    fontWeight: "600",
    fontSize: 14,
  },
  analyticsCard: {
    backgroundColor: "#111",
    borderRadius: 16,
    padding: 16,
    marginBottom: 25,
    borderWidth: 1,
    borderColor: "#222",
  },
  analyticsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  analyticsTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  aiBadge: {
    backgroundColor: "rgba(23, 122, 213, 0.15)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "rgba(23, 122, 213, 0.4)",
  },
  aiBadgeText: {
    color: "#177AD5",
    fontSize: 10,
    fontWeight: "600",
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  statBox: {
    flex: 1,
    backgroundColor: "#1c1c1c",
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 10,
    marginHorizontal: 3,
    alignItems: "center",
  },
  statLabel: {
    color: "#888",
    fontSize: 10,
    textAlign: "center",
  },
  statValue: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 4,
  },
  chartWrapper: {
    alignItems: "center",
    marginVertical: 10,
  },
  legendRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 15,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 12,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  legendText: {
    color: "#ccc",
    fontSize: 12,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
  },
  card: {
    backgroundColor: "#111",
    borderRadius: 17,
    borderWidth: 1,
    borderColor: "#222",
    overflow: "hidden",
  },
  detailsRow: {
    padding: 16,
  },
  label: {
    color: "#777",
    fontSize: 12,
    marginBottom: 6,
  },
  value: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "500",
  },
  input: {
    backgroundColor: "#1c1c1c",
    color: "#fff",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#333",
    fontSize: 14,
  },
  multilineInput: {
    minHeight: 60,
    textAlignVertical: "top",
  },
  demoRow: {
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  demoLabel: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "500",
  },
  demoSubText: {
    color: "#666",
    fontSize: 12,
    marginTop: 2,
  },
  demoPercent: {
    color: "#177AD5",
    fontSize: 16,
    fontWeight: "bold",
  },
  separator: {
    height: 1,
    backgroundColor: "#222",
  },
  logoutButton: {
    height: 56,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: "#333",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
    marginBottom: 30,
  },
  logoutText: {
    color: "#FF453A",
    fontSize: 16,
    fontWeight: "600",
  },
});
