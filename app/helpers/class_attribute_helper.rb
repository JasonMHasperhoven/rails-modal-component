module ClassAttributeHelper
  def parse_class(class_any)
    if class_any.is_a?(Array)
      safe_join(class_any, ' ')
    else
      ERB::Util.unwrapped_html_escape(class_any)
    end
  end

  def parse_to_class_name(class_any)
    class_name = ''
    class_name = class_any.join(' ') if class_any.is_a?(Array)
    class_name = class_any if class_any.is_a?(String)
    class_name
  end

  def parse_to_class_list(class_any)
    class_list = []
    class_list = class_any.split(' ') if class_any.is_a?(String)
    class_list = class_any if class_any.is_a?(Array)
    class_list
  end

  def extract_class_list(properties)
    class_list = []
    class_list << properties[:class_list] if properties[:class_list].present?
    class_list << properties[:class_name] if properties[:class_name].present?
    class_list
  end
end
