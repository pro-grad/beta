import React, { useState } from 'react'
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'

// ---------- Types ----------

type Question = {
  id: string
  question: string
  answer: string
}

type Topic = {
  id: string
  topicName: string
  completionDate: string | null
  questions: Question[]
}

type ProField = {
  id: string
  name: string
  topics: Topic[]
}

// ---------- Dummy data ----------
// Frontend-only for now — this whole array gets swapped for a real API call later.

const initialFieldsData: ProField[] = [
  {
    id: '223423',
    name: 'Software Engineering',
    topics: [
      {
        id: '03843',
        topicName: 'Cloud Architecture',
        completionDate: '2026-09-14',
        questions: [
          {
            id: 'q1',
            question: 'What is cloud architecture?',
            answer:
              'The way components like networks, servers, and storage are arranged to deliver cloud services.',
          },
          {
            id: 'q2',
            question: 'Name the three main service models.',
            answer: 'IaaS, PaaS, and SaaS.',
          },
        ],
      },
      {
        id: '03844',
        topicName: 'Data Structures & Algorithms',
        completionDate: null,
        questions: [
          {
            id: 'q3',
            question: 'What is the time complexity of inserting at the head of a linked list?',
            answer: 'O(1).',
          },
        ],
      },
      {
        id: '03845',
        topicName: 'System Design',
        completionDate: '2026-09-20',
        questions: [],
      },
    ],
  },
  {
    id: '223424',
    name: 'Accounting',
    topics: [
      {
        id: '04001',
        topicName: 'Financial Statements',
        completionDate: '2026-09-11',
        questions: [
          {
            id: 'q4',
            question: 'What are the three core financial statements?',
            answer:
              'The income statement, balance sheet, and statement of cash flows.',
          },
        ],
      },
      {
        id: '04002',
        topicName: 'Double-Entry Bookkeeping',
        completionDate: null,
        questions: [
          {
            id: 'q5',
            question: 'What does "debits must equal credits" mean?',
            answer: 'Every transaction affects at least two accounts and the books must stay balanced.',
          },
        ],
      },
      {
        id: '04003',
        topicName: 'Tax Fundamentals',
        completionDate: '2026-09-18',
        questions: [],
      },
      {
        id: '04004',
        topicName: 'Auditing Principles',
        completionDate: null,
        questions: [],
      },
    ],
  },
  {
    id: '223425',
    name: 'Business Management',
    topics: [
      {
        id: '05001',
        topicName: 'Strategic Planning',
        completionDate: null,
        questions: [],
      },
      {
        id: '05002',
        topicName: 'Operations Management',
        completionDate: '2026-09-25',
        questions: [
          {
            id: 'q6',
            question: 'What is the goal of operations management?',
            answer: 'To run the production of goods or services as efficiently as possible.',
          },
        ],
      },
      {
        id: '05003',
        topicName: 'Leadership & Team Building',
        completionDate: '2026-09-16',
        questions: [],
      },
    ],
  },
  {
    id: '223426',
    name: 'Marketing',
    topics: [
      {
        id: '06001',
        topicName: 'Market Research',
        completionDate: '2026-09-13',
        questions: [],
      },
      {
        id: '06002',
        topicName: 'Branding & Positioning',
        completionDate: null,
        questions: [
          {
            id: 'q7',
            question: 'What is a brand positioning statement?',
            answer: 'A short statement defining who a product is for and why it matters to them.',
          },
        ],
      },
      {
        id: '06003',
        topicName: 'Digital Advertising',
        completionDate: null,
        questions: [],
      },
    ],
  },
  {
    id: '223427',
    name: 'Nursing',
    topics: [
      {
        id: '07001',
        topicName: 'Patient Assessment',
        completionDate: '2026-09-17',
        questions: [
          {
            id: 'q8',
            question: 'What are the vital signs typically checked during assessment?',
            answer: 'Temperature, pulse, respiration rate, and blood pressure.',
          },
        ],
      },
      {
        id: '07002',
        topicName: 'Pharmacology Basics',
        completionDate: null,
        questions: [],
      },
      {
        id: '07003',
        topicName: 'Infection Control',
        completionDate: '2026-09-22',
        questions: [],
      },
    ],
  },
  {
    id: '223428',
    name: 'Law',
    topics: [
      {
        id: '08001',
        topicName: 'Contract Law',
        completionDate: null,
        questions: [
          {
            id: 'q9',
            question: 'What are the essential elements of a valid contract?',
            answer: 'Offer, acceptance, consideration, and mutual intent to be bound.',
          },
        ],
      },
      {
        id: '08002',
        topicName: 'Constitutional Law',
        completionDate: '2026-09-19',
        questions: [],
      },
      {
        id: '08003',
        topicName: 'Legal Writing & Research',
        completionDate: null,
        questions: [],
      },
    ],
  },
]

// ---------- Helpers ----------

function formatDate(date: string) {
  const d = new Date(`${date}T00:00:00`)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function daysUntil(date: string) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const target = new Date(`${date}T00:00:00`)
  const diff = Math.round((target.getTime() - today.getTime()) / 86400000)
  return diff
}

// ---------- Component ----------

function tasks() {
  const [fieldsData, setFieldsData] = useState<ProField[]>(initialFieldsData)
  const [searchInput, setSearchInput] = useState('')
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null)

  const [dateDraftTopicId, setDateDraftTopicId] = useState<string | null>(null)
  const [dateDraftValue, setDateDraftValue] = useState('')

  const [questionDraftTopicId, setQuestionDraftTopicId] = useState<string | null>(null)
  const [questionDraftText, setQuestionDraftText] = useState('')
  const [answerDraftText, setAnswerDraftText] = useState('')

  const [expandedTopicId, setExpandedTopicId] = useState<string | null>(null)

  const filteredFields = fieldsData.filter((field) =>
    field.name.toLowerCase().includes(searchInput.toLowerCase())
  )

  const selectedField = fieldsData.find((field) => field.id === selectedFieldId) ?? null

  const upcomingTasks = fieldsData
    .flatMap((field) =>
      field.topics
        .filter((topic) => topic.completionDate)
        .map((topic) => ({ ...topic, fieldName: field.name, fieldId: field.id }))
    )
    .sort((a, b) => (a.completionDate! < b.completionDate! ? -1 : 1))

  function updateTopic(topicId: string, updater: (topic: Topic) => Topic) {
    setFieldsData((prev) =>
      prev.map((field) => ({
        ...field,
        topics: field.topics.map((topic) =>
          topic.id === topicId ? updater(topic) : topic
        ),
      }))
    )
  }

  function saveCompletionDate(topicId: string) {
    if (!dateDraftValue.trim()) return
    updateTopic(topicId, (topic) => ({ ...topic, completionDate: dateDraftValue.trim() }))
    setDateDraftTopicId(null)
    setDateDraftValue('')
  }

  function addQuestion(topicId: string) {
    if (!questionDraftText.trim() || !answerDraftText.trim()) return
    updateTopic(topicId, (topic) => ({
      ...topic,
      questions: [
        ...topic.questions,
        { id: `${topicId}-${Date.now()}`, question: questionDraftText.trim(), answer: answerDraftText.trim() },
      ],
    }))
    setQuestionDraftTopicId(null)
    setQuestionDraftText('')
    setAnswerDraftText('')
  }

  // ---------- Field detail view ----------

  if (selectedField) {
    return (
      <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
        <TouchableOpacity onPress={() => setSelectedFieldId(null)} style={styles.backRow}>
          <Text style={styles.backArrow}>‹</Text>
          <Text style={styles.backLabel}>All fields</Text>
        </TouchableOpacity>

        <Text style={styles.title}>{selectedField.name}</Text>
        <Text style={styles.subtitle}>
          {selectedField.topics.length} topic{selectedField.topics.length === 1 ? '' : 's'}
        </Text>

        {selectedField.topics.map((topic) => {
          const isExpanded = expandedTopicId === topic.id
          const isEditingDate = dateDraftTopicId === topic.id
          const isAddingQuestion = questionDraftTopicId === topic.id

          return (
            <View key={topic.id} style={styles.card}>
              <TouchableOpacity
                style={styles.topicHeaderRow}
                onPress={() => setExpandedTopicId(isExpanded ? null : topic.id)}
                activeOpacity={0.8}
              >
                <View style={{ flex: 1 }}>
                  <Text style={styles.topicName}>{topic.topicName}</Text>
                  {topic.completionDate ? (
                    <Text style={styles.topicMeta}>
                      Target · {formatDate(topic.completionDate)}
                      {daysUntil(topic.completionDate) >= 0
                        ? `  ·  ${daysUntil(topic.completionDate)}d left`
                        : '  ·  overdue'}
                    </Text>
                  ) : (
                    <Text style={styles.topicMetaMuted}>No target date set</Text>
                  )}
                </View>
                <Text style={styles.chevron}>{isExpanded ? '⌄' : '›'}</Text>
              </TouchableOpacity>

              {isExpanded && (
                <View style={styles.expandedArea}>
                  {/* Completion date */}
                  {isEditingDate ? (
                    <View style={styles.inlineRow}>
                      <TextInput
                        placeholder="YYYY-MM-DD"
                        placeholderTextColor="#6B6B6B"
                        value={dateDraftValue}
                        onChangeText={setDateDraftValue}
                        style={styles.inlineInput}
                        autoCapitalize="none"
                      />
                      <TouchableOpacity
                        style={styles.smallButton}
                        onPress={() => saveCompletionDate(topic.id)}
                      >
                        <Text style={styles.smallButtonText}>Save</Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <TouchableOpacity
                      style={styles.secondaryAction}
                      onPress={() => {
                        setDateDraftTopicId(topic.id)
                        setDateDraftValue(topic.completionDate ?? '')
                      }}
                    >
                      <Text style={styles.secondaryActionText}>
                        {topic.completionDate ? 'Change target date' : '+ Set target date'}
                      </Text>
                    </TouchableOpacity>
                  )}

                  {/* Questions */}
                  <Text style={styles.questionsLabel}>
                    Questions ({topic.questions.length})
                  </Text>

                  {topic.questions.map((q) => (
                    <View key={q.id} style={styles.questionRow}>
                      <Text style={styles.questionText}>{q.question}</Text>
                      <Text style={styles.answerText}>{q.answer}</Text>
                    </View>
                  ))}

                  {isAddingQuestion ? (
                    <View style={styles.questionForm}>
                      <TextInput
                        placeholder="Question"
                        placeholderTextColor="#6B6B6B"
                        value={questionDraftText}
                        onChangeText={setQuestionDraftText}
                        style={styles.formInput}
                      />
                      <TextInput
                        placeholder="Answer"
                        placeholderTextColor="#6B6B6B"
                        value={answerDraftText}
                        onChangeText={setAnswerDraftText}
                        style={styles.formInput}
                      />
                      <View style={styles.inlineRow}>
                        <TouchableOpacity
                          style={styles.smallButton}
                          onPress={() => addQuestion(topic.id)}
                        >
                          <Text style={styles.smallButtonText}>Add</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.smallButtonGhost}
                          onPress={() => {
                            setQuestionDraftTopicId(null)
                            setQuestionDraftText('')
                            setAnswerDraftText('')
                          }}
                        >
                          <Text style={styles.smallButtonGhostText}>Cancel</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ) : (
                    <TouchableOpacity
                      style={styles.secondaryAction}
                      onPress={() => setQuestionDraftTopicId(topic.id)}
                    >
                      <Text style={styles.secondaryActionText}>+ Add a question</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}
            </View>
          )
        })}
      </ScrollView>
    )
  }

  // ---------- Browser + current tasks view ----------

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Select a field of choice</Text>

      <TextInput
        placeholder="Search for the field you want"
        placeholderTextColor="#6B6B6B"
        value={searchInput}
        onChangeText={setSearchInput}
        autoCapitalize="none"
        style={styles.searchInput}
      />

      <View style={styles.fieldList}>
        {filteredFields.map((field) => {
          const setCount = field.topics.filter((t) => t.completionDate).length
          return (
            <TouchableOpacity
              key={field.id}
              style={styles.fieldCard}
              onPress={() => setSelectedFieldId(field.id)}
              activeOpacity={0.8}
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.fieldName}>{field.name}</Text>
                <Text style={styles.fieldMeta}>
                  {field.topics.length} topic{field.topics.length === 1 ? '' : 's'}
                  {setCount > 0 ? `  ·  ${setCount} scheduled` : ''}
                </Text>
              </View>
              <Text style={styles.chevron}>›</Text>
            </TouchableOpacity>
          )
        })}

        {filteredFields.length === 0 && (
          <Text style={styles.emptyText}>No fields match “{searchInput}”.</Text>
        )}
      </View>

      {/* Current tasks */}
      <Text style={styles.sectionHeading}>Upcoming</Text>
      <View style={styles.taskList}>
        {upcomingTasks.length === 0 && (
          <Text style={styles.emptyText}>Set a target date on a topic to see it here.</Text>
        )}
        {upcomingTasks.map((task) => (
          <TouchableOpacity
            key={task.id}
            style={styles.taskCard}
            onPress={() => setSelectedFieldId(task.fieldId)}
            activeOpacity={0.8}
          >
            <View style={styles.taskDot} />
            <View style={{ flex: 1 }}>
              <Text style={styles.taskTitle}>{task.topicName}</Text>
              <Text style={styles.taskMeta}>
                {task.fieldName} · {formatDate(task.completionDate!)}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  )
}

// ---------- Styles ----------

const ACCENT = '#F2A93B'
const BG = '#000000'
const CARD_BG = '#121212'
const CARD_BORDER = '#262626'
const TEXT_PRIMARY = '#FFFFFF'
const TEXT_SECONDARY = '#9A9A9A'
const TEXT_MUTED = '#6B6B6B'

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: BG,
  },
  content: {
    padding: 20,
    paddingBottom: 48,
  },
  title: {
    color: TEXT_PRIMARY,
    fontSize: 26,
    fontWeight: '700',
    marginBottom: 4,
  },
  subtitle: {
    color: TEXT_SECONDARY,
    fontSize: 14,
    marginBottom: 20,
  },
  backRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  backArrow: {
    color: ACCENT,
    fontSize: 22,
    marginRight: 4,
  },
  backLabel: {
    color: ACCENT,
    fontSize: 15,
    fontWeight: '500',
  },
  searchInput: {
    backgroundColor: CARD_BG,
    borderWidth: 1,
    borderColor: CARD_BORDER,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: TEXT_PRIMARY,
    fontSize: 15,
    marginBottom: 20,
  },
  fieldList: {
    gap: 12,
  },
  fieldCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: CARD_BG,
    borderWidth: 1,
    borderColor: CARD_BORDER,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 18,
  },
  fieldName: {
    color: TEXT_PRIMARY,
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 4,
  },
  fieldMeta: {
    color: TEXT_SECONDARY,
    fontSize: 13,
  },
  chevron: {
    color: TEXT_MUTED,
    fontSize: 22,
    marginLeft: 8,
  },
  emptyText: {
    color: TEXT_MUTED,
    fontSize: 14,
    paddingVertical: 8,
  },
  sectionHeading: {
    color: TEXT_PRIMARY,
    fontSize: 20,
    fontWeight: '700',
    marginTop: 32,
    marginBottom: 12,
  },
  taskList: {
    gap: 10,
  },
  taskCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: CARD_BG,
    borderWidth: 1,
    borderColor: CARD_BORDER,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  taskDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: ACCENT,
    marginRight: 12,
  },
  taskTitle: {
    color: TEXT_PRIMARY,
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  taskMeta: {
    color: TEXT_SECONDARY,
    fontSize: 13,
  },
  card: {
    backgroundColor: CARD_BG,
    borderWidth: 1,
    borderColor: CARD_BORDER,
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 16,
    marginBottom: 12,
  },
  topicHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  topicName: {
    color: TEXT_PRIMARY,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  topicMeta: {
    color: ACCENT,
    fontSize: 13,
  },
  topicMetaMuted: {
    color: TEXT_MUTED,
    fontSize: 13,
  },
  expandedArea: {
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: CARD_BORDER,
    paddingTop: 16,
  },
  secondaryAction: {
    paddingVertical: 6,
  },
  secondaryActionText: {
    color: ACCENT,
    fontSize: 14,
    fontWeight: '500',
  },
  inlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  inlineInput: {
    flex: 1,
    backgroundColor: '#1A1A1A',
    borderWidth: 1,
    borderColor: CARD_BORDER,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: TEXT_PRIMARY,
    fontSize: 14,
  },
  smallButton: {
    backgroundColor: ACCENT,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 9,
  },
  smallButtonText: {
    color: '#1A1200',
    fontSize: 14,
    fontWeight: '700',
  },
  smallButtonGhost: {
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderWidth: 1,
    borderColor: CARD_BORDER,
  },
  smallButtonGhostText: {
    color: TEXT_SECONDARY,
    fontSize: 14,
    fontWeight: '600',
  },
  questionsLabel: {
    color: TEXT_SECONDARY,
    fontSize: 13,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  questionRow: {
    backgroundColor: '#1A1A1A',
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
  },
  questionText: {
    color: TEXT_PRIMARY,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  answerText: {
    color: TEXT_SECONDARY,
    fontSize: 13,
  },
  questionForm: {
    marginTop: 4,
    gap: 10,
  },
  formInput: {
    backgroundColor: '#1A1A1A',
    borderWidth: 1,
    borderColor: CARD_BORDER,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: TEXT_PRIMARY,
    fontSize: 14,
  },
})

export default tasks
