var sqlite3 = require("sqlite3").verbose();

var _getGrades = function(db,onComplete){
	var q = 'select * from grades';
	db.all(q,onComplete);
};

var _getStudentsByGrade = function(db,onComplete){
	_getGrades(db,function(err,grades){		
		db.all('select * from students', function(err1,students){
			
			grades.forEach(function(g){
				g.students = students.filter(function(s){return s.grade_id==g.id});
			})			
			onComplete(null,grades);
		})
	});	
};

var _getSubjectsByGrade = function(db,onComplete){
	_getGrades(db,function(err,grades){		
		db.all('select * from subjects', function(err1,subjects){
			
			grades.forEach(function(g){
				g.subjects = subjects.filter(function(s){return s.grade_id==g.id});
			})			
			onComplete(null,grades);
		})
	});	
};
var _getStudentSummary = function(id, db,onComplete){
	var student_grade_query = 'select s.name as name, s.id as id, g.name as grade_name, g.id as grade_id '+
		'from students s, grades g where s.grade_id = g.id and s.id='+id;
	var subject_score_query = 'select su.name, su.id, su.maxScore, sc.score '+
		'from subjects su, scores sc '+
		'where su.id = sc.subject_id and sc.student_id ='+id;
	var allGrades;
	db.all('select * from grades',function(err,rows){
				allGrades = rows;
	});
	db.get(student_grade_query,function(est,student){
		if(!student){
			onComplete(null,null);
			return;
		}
		db.all(subject_score_query,function(esc,subjects){			
			student.subjects = subjects;
			student.allGrades = allGrades;
			onComplete(null,student);
		})
	});
};

var _getSubjectSummary = function(db,onComplete){
	var subjectSummaryQuery = "select sub.id,sub.name,sub.maxScore,grade.name"+
	" as grade from subjects sub inner join grades grade on grade.id == sub.grade_id";
	db.all(subjectSummaryQuery,onComplete);
}

var _updateGrade = function(data,db,onComplete){
		var updateQuery = "update grades set name='"+data.new_grade+"' where id ="+data.prev_grade;
		db.run(updateQuery,onComplete(null,true));
};

var _updateStudentSummary = function(data,db,onComplete){
	var studentUpdateQuery = "update students set name='"+data.new_name+
						"',grade_id="+data.new_grade+" where id="+data.id;
	var scoreUpdateQuery = "update scores set score="+data.new_score+
						" where student_id="+data.id+" and subject_id="+data.subject;
	db.run(studentUpdateQuery,function(err){
		if(!err)
			db.run(scoreUpdateQuery,onComplete(null,true));	
	});				
};

var _updateSubjectSummary = function(data,db,onComplete){		
	var subjectUpdateQuery = "update subjects set name='"+data.new_name+"',maxScore="+
					data.new_score+",grade_id="+data.new_grade+" where id="+data.subject_id;
	db.run(subjectUpdateQuery,function(err){
		if(!err)
			onComplete(null,true);	
	});	
};

var init = function(location){
	var operate = function(operation){
		return function(){
			var onComplete = (arguments.length == 2)?arguments[1]:arguments[0];
			var arg = (arguments.length == 2) && arguments[0];
			var onDBOpen = function(err){
				if(err){onComplete(err);return;}
				db.run("PRAGMA foreign_keys = 'ON';");
				arg && operation(arg,db,onComplete);
				arg || operation(db,onComplete);
				db.close();
			};
			var db = new sqlite3.Database(location,onDBOpen);
		};	
	};

	var records = {		
		getGrades: operate(_getGrades),
		getStudentsByGrade: operate(_getStudentsByGrade),
		getSubjectsByGrade: operate(_getSubjectsByGrade),
		getStudentSummary: operate(_getStudentSummary),
		getSubjectSummary: operate(_getSubjectSummary),
		update_Grade:operate(_updateGrade),
		updateStudentSummary:operate(_updateStudentSummary),
		updateSubjectSummary:operate(_updateSubjectSummary)
	};

	return records;
};

exports.init = init;
////////////////////////////////////
exports.getSubjects = function(grade,callback){
	var subjects = grade == 'one' && [
		{name:'english-1',grade:'one',max:125},
		{name:'moral science',grade:'one',max:50},
		{name:'general science',grade:'one',max:100},
		{name:'maths-1',grade:'one',max:100},
		{name:'craft',grade:'one',max:25},
		{name:'music',grade:'one',max:25},
		{name:'hindi-1',grade:'one',max:75}
	] || [];
	callback(null,subjects);
};

exports.getScoresBySubject = function(subject,callback){
	var scores = subject != 'craft' && [] || [
		{name:'Abu',score:20},
		{name:'Babu',score:18},
		{name:'Ababu',score:21},
		{name:'Dababu',score:22},
		{name:'Badadadababu',score:23},
		{name:'babudada',score:24}
	];
	callback(null,scores);
};