# Nests Pods.xcodeproj inside the app project and makes the app target depend on
# the CocoaPods aggregate target. Xcode can then build HelplineStaff.xcodeproj
# directly; the pod targets are no longer reachable only through the workspace.
module EmbedPodsXcodeproj
  def self.integrate(installer)
    installer.aggregate_targets.each do |aggregate_target|
      user_project = aggregate_target.user_project
      next if user_project.nil?

      pods_project = installer.pods_project
      pods_target = pods_project.targets.find { |target| target.name == aggregate_target.label }
      next if pods_target.nil?

      embed_subproject(user_project, pods_project)
      aggregate_target.user_targets.each do |user_target|
        user_target.add_dependency(pods_target)
      end
      user_project.save
    end
  end

  def self.embed_subproject(user_project, pods_project)
    return if user_project.reference_for_path(pods_project.path)

    file_ref = user_project.new(Xcodeproj::Project::Object::PBXFileReference)
    file_ref.name = 'Pods.xcodeproj'
    file_ref.path = pods_project.path.relative_path_from(user_project.path.dirname).to_s
    file_ref.source_tree = '<group>'
    file_ref.last_known_file_type = 'wrapper.pb-project'
    user_project.main_group << file_ref

    product_group = user_project.new(Xcodeproj::Project::Object::PBXGroup)
    product_group.name = 'Products'
    product_group.source_tree = '<group>'

    pods_project.products_group.files.each do |product_reference|
      next if product_reference.path.nil?

      extension = File.extname(product_reference.path)[1..-1]
      file_type = product_reference.explicit_file_type ||
                  product_reference.last_known_file_type ||
                  Xcodeproj::Constants::FILE_TYPES_BY_EXTENSION[extension]
      next if file_type.nil?

      container_proxy = user_project.new(Xcodeproj::Project::Object::PBXContainerItemProxy)
      container_proxy.container_portal = file_ref.uuid
      container_proxy.proxy_type = Xcodeproj::Constants::PROXY_TYPES[:reference]
      container_proxy.remote_global_id_string = product_reference.uuid
      container_proxy.remote_info = File.basename(product_reference.path)

      reference_proxy = user_project.new(Xcodeproj::Project::Object::PBXReferenceProxy)
      reference_proxy.file_type = file_type
      reference_proxy.path = product_reference.path
      reference_proxy.remote_ref = container_proxy
      reference_proxy.source_tree = 'BUILT_PRODUCTS_DIR'
      product_group << reference_proxy
    end

    attribute = Xcodeproj::Project::Object::PBXProject.references_by_keys_attributes.find do |attr|
      attr.name == :project_references
    end
    project_reference = Xcodeproj::Project::ObjectDictionary.new(attribute, user_project.root_object)
    project_reference[:project_ref] = file_ref
    project_reference[:product_group] = product_group
    user_project.root_object.project_references << project_reference
  end
end
