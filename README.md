# @noloco/n8n-nodes-noloco

This is an n8n community node. It lets you use Noloco in your n8n workflows.

[Noloco](https://noloco.io) is a no-code platform for building internal tools and client portals. Connect your data sources and build custom applications without writing code.

[n8n](https://n8n.io/) is a [fair-code licensed](https://docs.n8n.io/reference/license/) workflow automation platform.

[Installation](#installation)  
[Operations](#operations)  
[Credentials](#credentials)  
[Compatibility](#compatibility)  
[Resources](#resources)

## Installation

Follow the [installation guide](https://docs.n8n.io/integrations/community-nodes/installation/) in the n8n community nodes documentation.

## Operations

This package includes two nodes:

### Noloco (Action Node)

Perform operations on Noloco records:

- **Create**: Create a new record in a collection
- **Delete**: Delete an existing record from a collection
- **Get**: Get a single record by ID
- **Get Many**: Get many records from a collection with optional filtering, sorting, and pagination
- **Search**: Search for records by field values
- **Update**: Update an existing record in a collection

### Noloco Trigger (Polling Trigger)

Start workflows when records change:

- **Record Created**: Triggers when a new record is created in a table
- **Record Updated**: Triggers when an existing record is updated in a table

## Credentials

To use this node, you need to configure Noloco API credentials with two API keys:

### Prerequisites

1. You must have access to a Noloco app
2. You need to generate API keys from your app's settings

### Setting Up Credentials

1. In your Noloco app, go to **Settings** > **Integrations & API Keys**
2. Copy the **Account API Key** - this authenticates your Noloco account
3. Copy the **App API Key** - this authenticates access to the specific app
4. In n8n, create new Noloco API credentials and paste both keys

For more details, see the [Noloco API Keys Guide](https://guides.noloco.io/settings/integrations-and-api-keys#api-keys).

## Compatibility

- Tested with n8n version 1.0+
- Requires Noloco REST API v1

## Resources

- [n8n community nodes documentation](https://docs.n8n.io/integrations/#community-nodes)
- [Noloco Documentation](https://guides.noloco.io/)
- [Noloco API Keys Guide](https://guides.noloco.io/settings/integrations-and-api-keys#api-keys)
- [Noloco Website](https://noloco.io)
