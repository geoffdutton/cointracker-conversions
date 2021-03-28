import { ConversionManager } from '../ConversionManager'

const mockStart = jest.fn().mockResolvedValue(undefined)

interface MockCreateConversionManager {
  (): ConversionManager
  __mockStart?: jest.Mock
}

const factory: MockCreateConversionManager = jest.fn().mockReturnValue({
  start: mockStart
})
factory.__mockStart = mockStart

export default factory
