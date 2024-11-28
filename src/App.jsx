import { useState } from 'react'
import { Button, Form, Header, Segment } from 'semantic-ui-react'
import 'semantic-ui-css/semantic.min.css'

const styles = `
  .default-value input {
    color: #6B7280 !important;
  }
`

function App() {
  const [responses, setResponses] = useState({
    form1: { message: '', status: '' },
    form2: { message: '', status: '' },
    form3: { message: '', status: '' }
  })

  const [formData, setFormData] = useState({
    form1: { value1: 'Civic', value2: '2020' },
    form2: { value1: "My only claim was a crash into my house's garage door that left a scratch on my car. There are no other crashes.", value2: '' },
    form3: { value1: '6614', value2: '5' }
  })

  const handleInputChange = (formId, field, value) => {
    setFormData(prev => ({
      ...prev,
      [formId]: {
        ...prev[formId],
        [field]: value
      }
    }))
  }

  const handleSubmit = async (formId) => {
    try {
      let response;
      let data;

      if (formId === 'form1') {
        const formDataObj = new FormData()
        formDataObj.append('model', formData[formId].value1)
        formDataObj.append('year', formData[formId].value2)

        response = await fetch('http://localhost:5567/api/calculateCarValue', {
          method: 'POST',
          body: formDataObj,
        })

        data = await response.json()
        
        if (data.error) {
          throw new Error(`${data.error}: ${data.description}`)
        }

        setResponses(prev => ({
          ...prev,
          [formId]: {
            message: `Car Value: $${data.car_value.toLocaleString()}`,
            status: 'success'
          }
        }))
      } else if (formId === 'form2') {
        const formDataObj = new FormData()
        formDataObj.append('claim_history', formData[formId].value1)

        response = await fetch('http://localhost:5567/api/calculateRiskRating', {
          method: 'POST',
          body: formDataObj,
        })

        data = await response.json()

        if (data.error) {
          throw new Error(`${data.error}: ${data.description}`)
        }
        
        setResponses(prev => ({
          ...prev,
          [formId]: {
            message: `Risk Rating: ${data.risk_rating}`,
            status: 'success'
          }
        }))
      } else if (formId === 'form3') {
        const formDataObj = new FormData()
        formDataObj.append('car_value', formData[formId].value1)
        formDataObj.append('risk_rating', formData[formId].value2)

        response = await fetch('http://localhost:5567/api/generateQuote', {
          method: 'POST',
          body: formDataObj,
        })

        data = await response.json()

        if (data.error) {
          throw new Error(`${data.error}: ${data.description}`)
        }
        
        setResponses(prev => ({
          ...prev,
          [formId]: {
            message: `Monthly Premium: $${data.monthly_premium.toFixed(2)}\nYearly Premium: $${data.yearly_premium.toFixed(2)}`,
            status: 'success'
          }
        }))
      } else {
        const response = {
          message: `Received values: ${formData[formId].value1} and ${formData[formId].value2}`,
          status: 'success'
        }
        setResponses(prev => ({
          ...prev,
          [formId]: response
        }))
      }
    } catch (error) {
      setResponses(prev => ({
        ...prev,
        [formId]: {
          message: error.message,
          status: 'error'
        }
      }))
    }
  }

  const renderResponseArea = (formId) => {
    const response = responses[formId]
    if (!response.message) return null

    const statusColors = {
      success: 'bg-green-50 border-green-200 text-green-700',
      error: 'bg-red-50 border-red-200 text-red-700',
      default: 'bg-gray-50 border-gray-200 text-gray-700'
    }

    const colorClass = statusColors[response.status] || statusColors.default

    return (
      <div className={`mt-6 p-4 rounded-lg border ${colorClass}`}>
        <Header as="h3" className="text-lg font-semibold mb-2">
          Response
        </Header>
        <pre className="whitespace-pre-wrap font-mono text-sm">
          {response.message}
        </pre>
      </div>
    )
  }

  const isDefaultValue = (formId, field) => {
    const defaults = {
      form1: { value1: 'Civic', value2: '2020' },
      form2: { value1: "My only claim was a crash into my house's garage door that left a scratch on my car. There are no other crashes." },
      form3: { value1: '6614', value2: '5' }
    }
    return formData[formId][field] === defaults[formId][field]
  }

  const renderForm = (formId, title) => (
    <div className="w-full max-w-[500px] mb-8">
      <Segment padded>
        <Header as="h2" className="text-xl font-bold mb-4">
          {title}
        </Header>
        <Form>
          <div className="flex flex-col gap-4">
            {formId === 'form2' ? (
              <Form.TextArea
                label="Claim History"
                placeholder="Enter claim history"
                value={formData[formId].value1}
                onChange={(e) => handleInputChange(formId, 'value1', e.target.value)}
                rows={4}
                style={{ color: isDefaultValue(formId, 'value1') ? '#6B7280' : 'inherit' }}
              />
            ) : (
              <Form.Input
                fluid
                label={formId === 'form1' ? "Car Model" : formId === 'form3' ? "Car Value" : "First Value"}
                placeholder={formId === 'form1' ? "Enter car model" : formId === 'form3' ? "Enter car value" : "Enter first value"}
                value={formData[formId].value1}
                onChange={(e) => handleInputChange(formId, 'value1', e.target.value)}
                className={isDefaultValue(formId, 'value1') ? 'default-value' : ''}
              />
            )}
            {formId !== 'form2' && (
              <Form.Input
                fluid
                label={formId === 'form1' ? "Year" : formId === 'form3' ? "Risk Rating" : "Second Value"}
                placeholder={formId === 'form1' ? "Enter year" : formId === 'form3' ? "Enter risk rating (1-5)" : "Enter second value"}
                value={formData[formId].value2}
                onChange={(e) => handleInputChange(formId, 'value2', e.target.value)}
                type={formId === 'form1' || (formId === 'form3') ? "number" : "text"}
                className={isDefaultValue(formId, 'value2') ? 'default-value' : ''}
              />
            )}
            <Button primary onClick={() => handleSubmit(formId)}>
              Submit
            </Button>
          </div>
        </Form>
        {renderResponseArea(formId)}
      </Segment>
    </div>
  )

  return (
    <div className="flex-1 flex flex-col items-center justify-start bg-gray-100 p-8">
      <style>{styles}</style>
      <div className="flex flex-col items-center w-full max-w-[500px]">
        <Header as="h1" className="text-3xl font-bold mb-8">
          API Testing Interface
        </Header>
        {renderForm('form1', 'API 01 - Car Value Calculator')}
        {renderForm('form2', 'API 02 - Risk Rating Calculator')}
        {renderForm('form3', 'API 03 - Quote Generator')}
      </div>
    </div>
  )
}

export default App
