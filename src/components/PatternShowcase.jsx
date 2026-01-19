import { 
  Button, 
  Card, 
  Badge, 
  Container, 
  Grid, 
  Flex, 
  Stack,
  Heading1,
  Heading2,
  Heading3,
  Paragraph,
  Text,
  Caption,
  Label
} from './patterns';

import './PatternShowcase.css';

const PatternShowcase = () => {
  return (
    <Container size="large" className="py-6">
      <Heading1 className="mb-6">UI Pattern Showcase</Heading1>
      <Paragraph className="mb-6 text-muted">
        Complete demonstration of all available UI patterns in the M1Cart application.
      </Paragraph>

      {/* Section: Buttons */}
      <section className="mb-8">
        <Heading2 className="mb-4">Buttons</Heading2>
        <Card variant="outlined">
          <Card.Body>
            <Stack spacing="large">
              {/* Primary Buttons */}
              <Stack spacing="medium">
                <Caption>Primary Variant</Caption>
                <Flex gap="medium" className="flex-wrap">
                  <Button>Small</Button>
                  <Button size="medium">Medium</Button>
                  <Button size="large">Large</Button>
                  <Button disabled>Disabled</Button>
                  <Button loading>Loading</Button>
                </Flex>
              </Stack>

              {/* Secondary Buttons */}
              <Stack spacing="medium">
                <Caption>Secondary Variant</Caption>
                <Flex gap="medium" className="flex-wrap">
                  <Button variant="secondary" size="small">Small</Button>
                  <Button variant="secondary">Medium</Button>
                  <Button variant="secondary" size="large">Large</Button>
                </Flex>
              </Stack>

              {/* Danger Buttons */}
              <Stack spacing="medium">
                <Caption>Danger Variant</Caption>
                <Flex gap="medium" className="flex-wrap">
                  <Button variant="danger" size="small">Delete</Button>
                  <Button variant="danger">Remove</Button>
                  <Button variant="danger" size="large">Clear All</Button>
                </Flex>
              </Stack>

              {/* Ghost Buttons */}
              <Stack spacing="medium">
                <Caption>Ghost Variant</Caption>
                <Flex gap="medium" className="flex-wrap">
                  <Button variant="ghost" size="small">Small</Button>
                  <Button variant="ghost">Medium</Button>
                  <Button variant="ghost" size="large">Large</Button>
                </Flex>
              </Stack>

              {/* Full Width */}
              <Stack spacing="medium">
                <Caption>Full Width</Caption>
                <Button fullWidth>Full Width Button</Button>
              </Stack>
            </Stack>
          </Card.Body>
        </Card>
      </section>

      {/* Section: Cards */}
      <section className="mb-8">
        <Heading2 className="mb-4">Cards</Heading2>
        <Grid columns={3} gap="large">
          <Card variant="elevated">
            <Card.Header>
              <h4>Elevated Card</h4>
            </Card.Header>
            <Card.Body>
              <Paragraph>This card has a subtle shadow elevation.</Paragraph>
            </Card.Body>
            <Card.Footer>
              <Button size="small">Action</Button>
            </Card.Footer>
          </Card>

          <Card variant="flat">
            <Card.Header>
              <h4>Flat Card</h4>
            </Card.Header>
            <Card.Body>
              <Paragraph>This card has a flat design with no shadow.</Paragraph>
            </Card.Body>
            <Card.Footer>
              <Button size="small" variant="secondary">Action</Button>
            </Card.Footer>
          </Card>

          <Card variant="outlined">
            <Card.Header>
              <h4>Outlined Card</h4>
            </Card.Header>
            <Card.Body>
              <Paragraph>This card has a subtle border outline.</Paragraph>
            </Card.Body>
            <Card.Footer>
              <Button size="small" variant="ghost">Action</Button>
            </Card.Footer>
          </Card>
        </Grid>
      </section>

      {/* Section: Badges */}
      <section className="mb-8">
        <Heading2 className="mb-4">Badges</Heading2>
        <Card variant="outlined">
          <Card.Body>
            <Stack spacing="large">
              <Stack spacing="medium">
                <Caption>Primary Badges</Caption>
                <Flex gap="small" className="flex-wrap">
                  <Badge variant="primary" size="small">Small</Badge>
                  <Badge variant="primary" size="medium">Medium</Badge>
                </Flex>
              </Stack>

              <Stack spacing="medium">
                <Caption>Status Badges</Caption>
                <Flex gap="small" className="flex-wrap">
                  <Badge variant="success">In Stock</Badge>
                  <Badge variant="danger">Out of Stock</Badge>
                  <Badge variant="warning">Limited</Badge>
                  <Badge variant="info">New</Badge>
                </Flex>
              </Stack>
            </Stack>
          </Card.Body>
        </Card>
      </section>

      {/* Section: Typography */}
      <section className="mb-8">
        <Heading2 className="mb-4">Typography</Heading2>
        <Card variant="outlined">
          <Card.Body>
            <Stack spacing="large">
              <Stack spacing="small">
                <Heading1>Heading 1</Heading1>
                <Heading2>Heading 2</Heading2>
                <Heading3>Heading 3</Heading3>
                <Heading4>Heading 4</Heading4>
              </Stack>

              <Stack spacing="small">
                <Paragraph>Normal paragraph with regular font weight.</Paragraph>
                <Paragraph size="small">Small paragraph for secondary information.</Paragraph>
                <Paragraph size="large">Large paragraph for emphasis.</Paragraph>
              </Stack>

              <Stack spacing="small">
                <Text>Default text color</Text>
                <Text variant="secondary">Secondary text color</Text>
                <Text variant="muted">Muted text color</Text>
                <Text variant="success">Success text color</Text>
                <Text variant="danger">Danger text color</Text>
              </Stack>

              <Stack spacing="small">
                <Caption>Caption text (uppercase, small)</Caption>
                <Label>Label for form inputs</Label>
              </Stack>
            </Stack>
          </Card.Body>
        </Card>
      </section>

      {/* Section: Layout Patterns */}
      <section className="mb-8">
        <Heading2 className="mb-4">Layout Patterns</Heading2>

        {/* Grid */}
        <Stack spacing="large" className="mb-6">
          <Stack spacing="small">
            <Heading3>Grid Layout</Heading3>
            <Caption>3-column responsive grid</Caption>
          </Stack>
          <Grid columns={3} gap="large">
            <Card variant="flat">
              <Card.Body>
                <h4>Grid Item 1</h4>
                <Paragraph size="small">Content here</Paragraph>
              </Card.Body>
            </Card>
            <Card variant="flat">
              <Card.Body>
                <h4>Grid Item 2</h4>
                <Paragraph size="small">Content here</Paragraph>
              </Card.Body>
            </Card>
            <Card variant="flat">
              <Card.Body>
                <h4>Grid Item 3</h4>
                <Paragraph size="small">Content here</Paragraph>
              </Card.Body>
            </Card>
          </Grid>
        </Stack>

        {/* Flex */}
        <Stack spacing="large" className="mb-6">
          <Stack spacing="small">
            <Heading3>Flex Layout</Heading3>
            <Caption>Flexible box layout with space-between</Caption>
          </Stack>
          <Card variant="outlined" className="bg-light">
            <Card.Body>
              <Flex justify="space-between" align="center">
                <h4 className="m-0">Title</h4>
                <Badge variant="info">New</Badge>
              </Flex>
            </Card.Body>
          </Card>
        </Stack>

        {/* Stack */}
        <Stack spacing="large">
          <Stack spacing="small">
            <Heading3>Stack Layout</Heading3>
            <Caption>Vertical stacking with consistent spacing</Caption>
          </Stack>
          <Card variant="flat">
            <Card.Body>
              <Stack spacing="medium">
                <div className="p-3 bg-white border rounded">Item 1</div>
                <div className="p-3 bg-white border rounded">Item 2</div>
                <div className="p-3 bg-white border rounded">Item 3</div>
              </Stack>
            </Card.Body>
          </Card>
        </Stack>
      </section>

      {/* Section: Utilities */}
      <section>
        <Heading2 className="mb-4">Utility Classes</Heading2>
        <Card variant="outlined">
          <Card.Body>
            <Stack spacing="large">
              {/* Spacing */}
              <Stack spacing="medium">
                <Caption>Spacing Utilities</Caption>
                <div className="m-4 p-3 bg-primary" style={{ color: 'white' }}>
                  .m-4 (margin) and .p-3 (padding)
                </div>
              </Stack>

              {/* Text */}
              <Stack spacing="medium">
                <Caption>Text Utilities</Caption>
                <Stack spacing="small">
                  <div className="text-left">text-left</div>
                  <div className="text-center">text-center</div>
                  <div className="text-right">text-right</div>
                  <div className="text-uppercase">text-uppercase</div>
                  <div className="fw-bold">fw-bold</div>
                </Stack>
              </Stack>

              {/* Colors */}
              <Stack spacing="medium">
                <Caption>Color Utilities</Caption>
                <Flex gap="medium" className="flex-wrap">
                  <div className="bg-primary text-white p-3 rounded">Primary</div>
                  <div className="bg-success text-white p-3 rounded">Success</div>
                  <div className="bg-danger text-white p-3 rounded">Danger</div>
                  <div className="bg-warning text-dark p-3 rounded">Warning</div>
                </Flex>
              </Stack>

              {/* Shadows */}
              <Stack spacing="medium">
                <Caption>Shadow Utilities</Caption>
                <Flex gap="medium" className="flex-wrap">
                  <div className="shadow-sm p-3">shadow-sm</div>
                  <div className="shadow p-3">shadow</div>
                  <div className="shadow-lg p-3">shadow-lg</div>
                </Flex>
              </Stack>
            </Stack>
          </Card.Body>
        </Card>
      </section>
    </Container>
  );
};

export default PatternShowcase;
