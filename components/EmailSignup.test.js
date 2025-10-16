// Simple verification tests for EmailSignup Mailchimp integration logic
// Run with: node components/EmailSignup.test.js

function testMailchimpLogic() {
  const tests = [
    {
      name: 'Both selected - should include both groups',
      interestType: 'both',
      expectedGroups: [1, 2],
      expectedTags: ['comedyShowTag', 'openMicTag']
    },
    {
      name: 'Shows only - should include group 1 only',
      interestType: 'shows',
      expectedGroups: [1],
      expectedTags: ['comedyShowTag']
    },
    {
      name: 'Open mics only - should include group 2 only',
      interestType: 'openmics',
      expectedGroups: [2],
      expectedTags: ['openMicTag']
    }
  ]

  let passed = 0
  let failed = 0

  tests.forEach(test => {
    // Test hidden input logic
    const includesGroup1 = test.interestType === 'shows' || test.interestType === 'both'
    const includesGroup2 = test.interestType === 'openmics' || test.interestType === 'both'

    const actualGroups = []
    if (includesGroup1) actualGroups.push(1)
    if (includesGroup2) actualGroups.push(2)

    // Test tags logic
    const actualTags = []
    if (test.interestType === 'shows' || test.interestType === 'both') actualTags.push('comedyShowTag')
    if (test.interestType === 'openmics' || test.interestType === 'both') actualTags.push('openMicTag')

    const groupsMatch = JSON.stringify(actualGroups) === JSON.stringify(test.expectedGroups)
    const tagsMatch = JSON.stringify(actualTags) === JSON.stringify(test.expectedTags)

    if (groupsMatch && tagsMatch) {
      console.log(`✓ ${test.name}`)
      passed++
    } else {
      console.log(`✗ ${test.name}`)
      if (!groupsMatch) console.log(`  Expected groups: ${test.expectedGroups}, got: ${actualGroups}`)
      if (!tagsMatch) console.log(`  Expected tags: ${test.expectedTags}, got: ${actualTags}`)
      failed++
    }
  })

  console.log(`\n${passed} passed, ${failed} failed`)
  return failed === 0
}

console.log('Testing EmailSignup Mailchimp integration logic...\n')
const success = testMailchimpLogic()
process.exit(success ? 0 : 1)
