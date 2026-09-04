# Agent-tool contract catalog

Load only the operation being invoked. Each file is a characterization-fixture schema with top-level `input` and `result`: the whole schema validates a recorded request/result pair, `#/properties/input` validates the literal runtime invocation, and `#/properties/result` validates the recorded response. The tool never receives the containing `{input,result}` object. Input is mechanically derived from the exact strict application schema. Application source declares no equivalent strict result schema, so `result` fixes observed status families while owning workflows define record meaning. JSON Schema cannot preserve every Zod refinement or compare values across input and result; workflow validation rules remain authoritative. Hand-characterized operation files may add evidenced cross-field constraints beyond the mechanical shape.

## Read operations

- [`search_gigs_and_people`](operations/search_gigs_and_people.schema.json)
- [`list_gigs`](operations/list_gigs.schema.json), [`get_gig`](operations/get_gig.schema.json)
- [`list_people`](operations/list_people.schema.json), [`get_person`](operations/get_person.schema.json)
- [`list_gig_person_relationships`](operations/list_gig_person_relationships.schema.json), [`get_gig_person_relationship`](operations/get_gig_person_relationship.schema.json)
- [`list_tasks`](operations/list_tasks.schema.json), [`get_task`](operations/get_task.schema.json)
- [`list_interactions`](operations/list_interactions.schema.json), [`get_interaction`](operations/get_interaction.schema.json)
- [`list_documents`](operations/list_documents.schema.json), [`list_document_versions`](operations/list_document_versions.schema.json), [`get_document`](operations/get_document.schema.json)

## Mutation operations

- [`create_gig`](operations/create_gig.schema.json), [`update_gig`](operations/update_gig.schema.json)
- [`create_person`](operations/create_person.schema.json), [`update_person`](operations/update_person.schema.json)
- [`create_gig_person_relationship`](operations/create_gig_person_relationship.schema.json)
- [`create_task`](operations/create_task.schema.json), [`update_task`](operations/update_task.schema.json)
- [`create_interaction`](operations/create_interaction.schema.json), [`update_interaction`](operations/update_interaction.schema.json), [`delete_interaction`](operations/delete_interaction.schema.json)
- [`create_document`](operations/create_document.schema.json), [`update_document`](operations/update_document.schema.json)
- [`revert_change`](operations/revert_change.schema.json)
